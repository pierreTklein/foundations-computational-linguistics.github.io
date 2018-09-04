---
layout: hidden
title: 7 N-gram Models
---

# Dependencies between Words

In the last few lectures we have studied the categorical bag of words model, including how to choose from models in this class using the principle of maximum likelihood as well as Bayesian inference. Recall that our original goal was to distinguish strings of words that are grammatical from those that are not, such as in the following cases. 

> Colorless green ideas sleep furiously.  
> $$^*$$Furiously green sleep ideas colorless. 

Since a BOW model necessary generates every possible sequence of words over the vocabulary (i.e., $$[V]^*$$) it cannot capture such distinctions. We need some way of capturing **dependencies between words**. For instance, note that there is a dependency between the word *green* and the word *ideas* in the grammatical sentence above. *Green* is an adjective which *modifies* the nominal *head* *ideas*. What kinds of models can we use to define such dependencies. 


# Ngram Models

An *ngram* is a length $$n$$ sequence of words over our vocabulary, also called an *n-factors*. The basic idea behind an ngram model is that the the $$n$$th word depends on the $$(n-1)$$ words that precede it. That is, we choose the $$n$$th word, given the preceding words. In mathematical notation that is equivalent to the following.

$$\Pr(W^{(1)},\dots,W^{(k)})=\prod_i^k \Pr(W^{(i)} | W^{(i-n-1)}=w^{(i-n-1)},\dots,W^{(i-1)}=w^{(i-1)})$$

How can we define these distributions? Well, each distribution is just a distribution over our vocabulary conditioned on a particular sequence of words. Thus, a natural way to define these distributions is to use a categorical distribution for each conditional distribution. In squiggle notation, we can write this as. 

$$\begin{align}w^{(i)} \mid w^{(i-n)}, \dots, w^{(i-1)} &\sim&\mathrm{categorical}(\vec{\theta}_{w^{(i-n)}, \dots, w^{(i-1)}}) & \\
w^{(i)} \mid  w^{(i-k)}, \dots, w^{(i-1)} &\sim& \mathrm{categorical}(\vec{\theta}_{\rtimes, w^{(i-k)}, \dots, w^{(i-1)}})\ & ,0 \leq  k < n\\
\end{align}$$

or in the case of a *bigram* model, where $$n=2$$:

$$\Pr(W^{(1)},\dots,W^{(k)})=\prod_i^k \Pr(W^{(i)} | W^{(i-1)}=w^{(i-1)})$$

$$\begin{align}w^{(i)} \mid  w^{(i-1)} &\sim&\mathrm{categorical}(\vec{\theta}_{w^{(i-1)}}) & \\
w^{(1)} &\sim& \mathrm{categorical}(\vec{\theta}_{\rtimes})\ & \\
\end{align}$$

Note the crucial thing about this model is that there is a separate distribution for each context parameterized by $$\vec{\theta}_{w^{(i-n)}, \dots, w^{(i-1)}}$$. Where should these parameters come from? A natural solution is to draw each of them from a Dirichlet distribution. 

$$\begin{align}
\vec{\theta}_{\mathbf{c}} \mid \vec{\alpha} &\sim& \mathrm{Dirichlet}(\vec{\alpha}) \\
w^{(i)} \mid w^{(i-n)}, \dots, w^{(i-1)} &\sim&\mathrm{categorical}(\vec{\theta}_{w^{(i-n)}, \dots, w^{(i-1)}}) & \\
w^{(i)} \mid  w^{(i-k)}, \dots, w^{(i-1)} &\sim& \mathrm{categorical}(\vec{\theta}_{\rtimes, w^{(i-k)}, \dots, w^{(i-1)}})\ & ,0 \leq  k < n\\
\end{align}$$

Note that here we are using the variable $$\mathbf{c}$$ to range over any *context* which is the $$n-1$$ symbols before the last in the $$ngram$$. Also note that there are **many** contexts, in particular there are $$\mid V \mid^{(n-1)}$$ different sequences that we might need to condition on. For instance if we were using 6grams (admittedly a largeish ngram order) and had a vocabulary of just 500 words (a small vocabulary), there would be 31,250,000,000,000 possible contexts, and thus 31,250,000,000,000 different parameter vectors $$\vec{\theta}_{\mathbf{c}}$$. As you can see, this number can grow very large very fast. 

Also, note that we draw all of the parameters for these different distributions from a Dirichlet distribution with the same parameter vector $$\vec{\alpha}$$. In this case, we say that the parameter vector is *shared* or *tied* across the model. 

# Persistent Randomness with "mem"

When we worked with the Dirichlet-categorical distribution we only had a single draw from our Dirichlet distibution. As noted above, we are now in a starkly different situation where we have a potentially exponential number of categorical distributions. How can deal with the fact that we want to store and remember all of these Dirichlet draws?

We want to draw each vector $$\vec{\theta}_{\mathbf{c}}$$ just when we first need it, since there are many contexts which in practice can never come up. To see this note that if we wanted all 31,250,000,000,000 contexts mentioned above to occur even once, we would need a corpus which is orders of magnitudes bigger than the Google books corpus. There is no data big enough for that.

Thus, we want to draw each $$\vec{\theta}_{\mathbf{c}}$$ *lazily* just when we need it. We also want to avoid having to name a variable by hand for each of these draws. One very useful construct for achieving this is *memoization*. 

Memoization refers to a technique where we intercept calls to a function with some arguments, check if the function has been called with those arguments before and, if not, call the function on those arguments, get the result, store it in a table and return it. On subsequent calls to that function with those arguments, we simply look up the result in the table and avoid recomputing the value.

Memoization is an important technique for optimization in computer science (it is closely related to *caching*) and will play a fundamental role in the algorithms we study later in this course. 

However, less widely known, is that memoization is a technique for achieving what is sometimes call *persisten randomness* in probabilistic models. 

In Clojure, there already exists a higher-order procedure, *memoize*, which takes another procedure and memoizes it.

```
(defn flip [weight]
  (if (< (rand 1) weight)
      true
      false))

(def mem-flip (memoize flip))
(mem-flip 0.5)
(mem-flip 0.5)
(mem-flip 0.5)
(mem-flip 0.5)

(def mem-flip-2 (memoize flip))
(mem-flip-2 0.5)
(mem-flip-2 0.5)
(mem-flip-2 0.5)
(mem-flip-2 0.5)
```
# Hierarchical Ngram Models with Memoization

With "mem" defined, we can define hierarchical ngram models. We will first define a function which samples from a Dirichlet distribution.

```
(defn repeat [f n]
  (if (= n 0)
      '()
      (cons (f) (repeat f (- n 1)))))

(defn normalize [params]
  (let [sum (apply + params)]
    (map (fn [x] (/ x sum)) params)))

(defn sample-categorical [outcomes params]
  (if (flip (first params))
      (first outcomes)
      (sample-categorical (rest outcomes) 
                          (normalize (rest params)))))


(defn sample-gamma [shape scale]
  (apply + (repeat (fn [] (- (Math/log (rand)))) shape)))

(defn sample-dirichlet [pseudos]
  (let [gammas (map (fn [sh]
                     (sample-gamma sh 1))
                pseudos)]
    (normalize gammas)))

(sample-dirichlet (list 1 1 1))

```

Now we can define the full hierarchical model.

```
(def vocabulary '(call me Ishmael stop))
(def n 3)

(defn update-context [old-context new-symbol]
  (if (>= (count old-context) n)
      (concat  (rest old-context) (list new-symbol))
      (concat old-context (list new-symbol))))

(update-context (list 1) 2)

(defn list-unfold [generator context current stop?]
  (if (stop? current)
      (list current)
      (let [new-context (update-context context current)
            next (generator new-context)]
        (cons current
              (list-unfold generator 
                           new-context
                           next
                           stop?)))))

(def context->probs
  (memoize (fn [context]
             (sample-dirichlet (repeat  (fn [] 1) (count vocabulary))))))

(context->probs 'call)

(defn stop? [context]
  (= context 'stop))

(defn generator [context]
  (sample-categorical vocabulary (context->probs context)))

(list-unfold generator '() 'start stop?)


```
