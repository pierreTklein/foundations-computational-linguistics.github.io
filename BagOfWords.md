---
title: Bag of Words Models
---

# Bag of Words Models

Suppose we had a corpus representing the tokens in some document, like the text of *Moby Dick*. How can we write a sampler for that text? Whatever our model is it must *put probability mass* on all of the words that appear in the book, i.e., if it assigned probability $$0$$ to the word *Ishmael*, then the probability of the whole corpus would also be $$0$$. One very simple way to model (maybe the simplest possible) is called the *bag of words*  (BOW) approach. Under this approach, we assume that each word is generated separately from some distribution without reference to the other words. Since there are no dependencies between words, we call the result a simple "bag" of words. Equipped with the categorical distribution, we can easily define a simple bag of words model for sentences. 

```
(defn flip [p]
  (if (< (rand 1) p)
      true
      false))

(defn normalize [params]
  (let [sum (apply + params)]
    (map (fn [x] (/ x sum)) params)))


(defn sample-categorical [outcomes params]
  (if (flip (first params))
      (first outcomes)
      (sample-categorical (rest outcomes) 
                          (normalize (rest params)))))


(def vocabulary (list 'call 'me 'Ishmael))
(def probabilities (list (/ 1 3) (/ 1 3 ) (/ 1 3)))

(sample-categorical vocabulary probabilities)
(defn sample-BOW-sentence [len]
        (if (= len 0)
          '()
          (cons (sample-categorical vocabulary probabilities)
            (sample-BOW-sentence (- len 1)))))
(sample-BOW-sentence 3)
```

# Joint Distributions

The distribution defined by the sampler "sample-BOW-sentence" produces compound or complex structures, consisting of lists of random variables. As we mentioned before, the random variable represented by a call to "sample-BOW-sentence" can be thought of as consisting of several component random variables. For instance, in the following call, the output contains two words, each of which corresponds to one sample from the categorical distribution over the vocabulary.

Let's call the random variable representing the first word $$W^{(1)}$$ and the random variable representing the second word $$W^{(2)}$$, etc.. Now, we can talk about the *joint distribution* over variables $$W^{(1)}$$ and $$W^{(2)}$$, $$\Pr(W^{(1)},W^{(2)})$$. The *joint distribution* over a set of random variables is one of the most fundamental concepts in probabilistic modeling and we will return to it many times. 

## Constructing Joint Distributions

What is a joint distribution? We have defined a distribution as consisting of a *sample space* or *support* together with a *probability mass function*. What is the joint distribution over some set of random variables $$X_1,\dots,X_n$$? We need two ingredients, first we need to specify our support. The support of the joint distribution $$\Pr(X_1,\dots,X_n)$$ over random variables is the cartesian product of the supports of the individual variables. The probability is more complex, and in the fully general case might consist of a table with an entry for every combination of values in the support of the joint distribution.

# Generating General Sequences: "list-unfold"

Notice the pattern used to define "sample-BOW-sentence". Here we used a recursion on the length of the output string. This function is a special case of a general pattern known as an *unfold*, which looks like this. 

```
(defn list-unfold [generator len]
        (if (= len 0)
          '()
          (cons (generator)
            (list-unfold generator (- len 1)))))

(defn sample-BOW-sentence [len]
        (list-unfold (fn []
                       (sample-categorical 
                         vocabulary 
                         probabilities)) 
          len))

(sample-BOW-sentence 3)
```

List unfolds, generally speaking, take two pieces of information, a generator for individual elements of a list and some information that can be used to tell them when to stop generating. We will see several instances of this general pattern. 

# Scoring a Sequence: "list-foldr"
An **unfold** operation is a generator for structured objects like lists. A *fold* operation is something which takes a list and produces a single value at the end. As such, we can use "list-fold" to implement a scorer for our lists. 

Crucially, each random variable representing a word $$W^{(i)}$$ in a BOW model is generated *independently*. In other words, the distribution over the values each $$W^{(i)}$$ can take on are not influenced by the values for any other word. The *product rule* of probability says that the joint distribution over two independent random variables is given by the product of the probabilities of each random variable in isolation. That is, if *call* occurs one third of the time, and *me* occurs one third of the time, then *call me* occurs one ninth of the time in all sequences of two $$W^{(i)}$$ random variables. 

```
(def vocabulary '(call me Ishmael))
(def probabilities (list (/ 1 3) (/ 1 3 ) (/ 1 3)))
(defn score-categorical [outcome outcomes params]
  (if (empty? params)
      (error "no matching outcome")
      (if (= outcome (first outcomes))
          (first params)
          (score-categorical outcome (rest outcomes) (rest params)))))

(defn list-foldr [f base lst]
  (if (empty? lst)
      base
      (f (first lst)
         (list-foldr f base (rest lst)))))

(defn score-BOW-sentence [sen]
  (list-foldr 
   (fn [word rest-score] 
     (* (score-categorical word vocabulary probabilities)
        rest-score))
   1
   sen))

(score-BOW-sentence '(call))
(score-BOW-sentence '(call me))
(score-BOW-sentence '(call me Ishmael))
```

Under a BOW model, the probability of a sentence is just the product of the probabilities of each of the words used in that string. In other words:

$$\Pr(w^{(1)},...,w^{(k)}\mid \vec{\theta}) = \prod^k_{i=1} \theta_{w^{(i)}}$$

Since multiplication is commutative and associative, we can gather up all of the terms that refer to any copies of the same word. If $$n_w$$ is the count of word (type) $$w$$ from the vocabulary $$V$$ in the sentence, then the probability of the sentence can be written.

$$\Pr(w^{(1)},...,w^{(k)}\mid \vec{\theta}) = \prod_{w^\prime \in V} \theta_{w^\prime }^{n_{w^\prime }}$$

In other words, all we need really is the counts of each word in the sentence to calculate the probability. Why is this?

# Evaluating the Bag of Words Model: Likelihoods

Equipped with a scoring function, like the one above, we can evaluate the probability of a dataset under our model. The score of a data set under some model is often called the *likelihood* of the data. Technically, the term likelihood refers to a measure of goodness of fit of the model, when the dataset is considered to be fixed, but the model is allowed to vary (see below). That is, likelihood is technically a function of the model (parameters) given the data. Thus, purists will often refer to the *likelihood of the model* or the *likelihood of the parameters* rather than the *likelihood of the data*. But everyone uses the latter phrase in practice.

Let's set up a toy corpus under our bag-of-words model with a (uniform) categorical distribution as the generator. Just to make it interesting, let's use a "corpus" with two sentences and a significantly larger vocabulary.

```
(def my-corpus '((Call me Ishmael)
                 (Some years ago - never mind how long precisely - 
                   having little or no money in my purse |,| and 
                   nothing particular to interest me on shore |,| 
                   I thought I would sail about a little and see 
                   the watery part of the world)))

(def vocabulary '(Call me Ishmael Some years ago - never mind how long precisely - 
                   having little or no money in my purse |,| and 
                   nothing particular to interest on shore 
                   I thought would sail about a little see 
                   the watery part of the world))

(defn repeat [f n]
  (if (= n 0)
      '()
      (cons (f) (repeat f (- n 1)))))

(def probabilities (repeat (fn [] (/ 1 (count vocabulary))) (count vocabulary)))

probabilities
```

With these set up we can score the corpus under our model. 

```
(defn score-corpus [corpus]
  (list-foldr
   (fn [sen rst]
     (* (score-BOW-sentence sen) rst))
   1
   corpus))

(score-corpus my-corpus)
```

What did we do here? Each sentence in a BOW model the result of sampling each word independently from the categorical with parameters $$\theta$$ (uniform in this case) and each sentence is sampled independently from other sentences. Thus, the probability of the whole corpus $$C$$ is given by:


$$\Pr(C \mid \vec{\theta}) = \prod_{s\in C} \prod_{w \in s} \theta_{w}$$

Again, since multiplication is associative and commutative, if we know the total count of each word in the corpus as a whole $$n_w$$, we can rewrite this last term as:

$$\Pr(C \mid \vec{\theta}) = \prod_{w^\prime \in V} \theta_{w^\prime }^{n_{w^\prime }}$$

That it, it suffices to simply know the total number of times each word was used in the corpus to calculate the probability of the corpus. 

This last example illustrates why we usually work in log probabilities. Even with this relatively small corpus and categorical distribution, the overall probability of the corpus gets very small very quickly. 


## Log Likelihoods 

As we discussed in the last unit, we often make use of log probabilities in order to avoid underflow errors with extremely small probabilities such as the one above. Let's score the corpus in the last example with log probabilities instead of probabilities.

```
(defn score-BOW-sentence [sen]
  (list-foldr 
   (fn [word rest-score] 
     (+ (Math/log2 (score-categorical word vocabulary probabilities))
        rest-score))
   0
   sen))

(defn score-corpus [corpus]
  (list-foldr
   (fn [sen rst]
     (+ (score-BOW-sentence sen) rst))
   0
   corpus))

(score-corpus my-corpus)    
```

As you can see, this number is of more manageable magnitude. We now have a way to evaluate our model on our corpus numerically. The number, is called the *log likelihood* of our model given out data. It scores the goodness of fit of the model on this dataset. 

# Classes of Models

When we study formal systems for describining linguistic structure, we are typically interested in **kinds** or **categories** of systems, rather than specific systems. In computational models, statistics, and formal language theory, these are called *classes* of models. 

For example, the simple bag of words approach to generating and scoring sentence structures that we have set up is, actually, not a specific model but a **class** of models, each particular model is given by choosing some specific vocabulary and distribution over this vocabulary. One (but not the only) reason to focus on classes of models is that it gives us a way of narrowing the scope of model comparisons so that we can say precise things about fit to data.

# Comparing Models in the Class of BOW Models

Equipped with our (log) likehoods we can now evaluate different models with respect to particular models in this class. 

With a such a simple class of models, it may be hard to see how one model could be much better than another. But consider the following example. Suppose our corpus consisted of seven copies of the sentence *call me Ishmael*.

```
(def my-corpus '((Call me Ishmael)
                 (Call me Ishmael)
                 (Call me Ishmael)
                 (Call me Ishmael)
                 (Call me Ishmael)
                 (Call me Ishmael)
                 (Call me Ishmael)))

(def vocabulary '(Call me Ishmael Some years ago - never mind how long precisely - 
                   having little or no money in my purse , and 
                   nothing particular to interest me on shore 
                   I thought would sail about a little see 
                   the watery part of the world))
  
(score-corpus my-corpus) 
```

Here we have replaced our corpus with many repeats of the same sentence, while holding our vocabulary constant.  Here the probability of each element of our vocabulary is $$\frac{1}{43}$$ because we used a uniform distribution over the entire set of words from before. However, in our corpus, we only use three of these words, several times each. Clearly we can do better by setting the probability associated with the words *call* *me* and *Ishmael* higher than the probability of the other words. 

Let's see what happens when we reparameterize our categorical to place all of its probability mass on just the three words that appear in the corpus. 
```
(defn score-BOW-sentence [sen]
  (list-foldr 
   (fn [word rest-score] 
     (+ (Math/log2 (score-categorical word vocabulary probabilities))
        rest-score))
   0
   sen))

(defn score-corpus [corpus]
  (list-foldr
   (fn [sen rst]
     (+ (score-BOW-sentence sen) rst))
   0
   corpus))

(def vocabulary '(Call me Ishmael))
(def probabilities (repeat (fn [] (/ 1 (count vocabulary))) (count vocabulary)))
(score-corpus my-corpus)
```
As we can see, this model assigns a significantly higher score to this corpus. This in fact, is much higher probability, remember that the log probability is (negative) the number of times that we must multiply $$\frac{1}{3}$$ together to get the probability. 

# The Principle of Maximum Likelihood

What is the general principle we used above? This is known as the principle of *maximum likelihood* which states that we should choose the model in our class which maximizes the likelihood of our data. If our class of models is parameterized (or indexed) by some parameter vector $$\vec{\theta} \in \Theta$$ then the principle of maximum likehood says we should choose some model indexed by (parameters) $$\hat{\theta}$$ that maximizes the (log) likelihood of the model given the data $$C$$, i.e.,  $$\mathcal{L}(\theta;C)$$

$$\DeclareMathOperator*{\argmax}{arg\,max} 
\hat{\theta} = \underset {\theta \in \Theta }\argmax \mathcal{L}(\theta;C)
$$

Recall that the likelihood of the corpus under our model is:

$$\Pr(C \mid \vec{\theta}) = \prod_{w^\prime \in V} \theta_{w^\prime }^{n_{w^\prime }}$$

In other words, it is just the product of the probabilities of each word raised to the number of times that word appeared in the corpus. Thus, the log likehood is as follows.

$$\mathcal{L}(\theta;C) = \log \prod_{w^\prime \in V} \theta_{w^\prime }^{n_{w^\prime }}=\sum_{w^\prime \in V} n_{w^\prime}\log(\theta_{w^\prime})$$

So, which probabilities maximize this quantity? It is a bit complicated to show (a simple proof uses Lagrange multipliers), but the probabilities for each word which maximize the log likelihood are:

$$\hat{\theta}_{w} = \frac{n_{w}}{\sum_{w^\prime \in V} n_{w^\prime}}$$

In other words, the optimal probabilities for each word under the principle of maximum likelihood are simply the renormalized counts. Now we can see why our restriction of the vocabulary to just the words in the restricted corpus gave us a higher likelihood --- it was simply the log likelihood estimator.


# Bag of Words Models and Natural Language

What sorts of formal languages **can** a BOW model generate in principle? Are these good models of natural language? It is fairly easy to see that if the categorical distribution in one of our bag-of-words models places probability mass on all of the elements of the vocabulary $$V$$, then it places mass on all of the elements of $$[V]^*$$. Thus, if a BOW model can generate a sequence like *Colorless green ideas sleep furiously*, then it can also generate every permutation of that sequence, including ungrammatical permutations.

This fact is a simple consequence of the independence assumptions made by the BOW model. In the next few sections we study these independence assumptions in more detail and introduce a few more fundamental concepts.


## BOW Models and Independence

The laws of probability say that the probability of the joint distribution constructed over independent random variables is simply the product of the probability distributions for each. 

$$\Pr(A=a,B=b)=\Pr(A=a)P(B=b)$$

This is, in fact, the definition of statistical independence. Whenever the distributions of two random variables follow the law above, they are independent.

With this in mind we can calculate the probability of each *point* or *state* in the joint distribution. To make things interesting, let's assume that our categorical distribution is defined over the set $$\{call, me, Ishmael\}$$ but is not *uniform*, and instead has the parameters $$\langle \frac{1}{2}, \frac{1}{4},\frac{1}{4} \rangle$$. Our sample or outcome space is the space of length $$2$$ sequences of words, such as $$[call\ me]$$. We can write this distribution down as a table or matrix, with a dimension for each random variable $$W_i$$.


|         |*call*|*me* |*Ishmael*|
|---      |---|---|---|
| *call*  |  .25 |0.125|0.125|
| *me*    |   0.125 |0.0625|0.0625|
|*Ishmael*|  0.125 |0.0625|0.0625|

## Marginal Distributions

One of the most important operations of probability theory is *marginalization*, which means computing the  distribution of one random variable averaging over or ignoring another. What does this mean?

Consider the probability of $$W_2$$ in our running example, that is $$P(W_2)$$. What is the probability that the second word takes on the value *Ishmael* $$P(W_2=Ishmael)$$ in the joint distribution? One was we can think about this is that in the *joint space* $$[W_1 W_2]$$, there are three points or states where $$W_2=Ishmael$$: $$[W_1=call\ W_2=Ishmael]$$ $$[W_1=me\ W_2=Ishmael]$$ $$[W_1=Ishmael\ W_2=Ishmael]$$. So the *total* or *marginal probability* of $$W_2=Ishmael$$ is 

$$\sum_{w \in W_1} P(W_1=w, W_2=Ishmael)$$

In other words, the marginal probability adds up all of the probabilities in the joint distribution where $$W_2=Ishmael$$, ignoring values of $$W_1$$. Another way to look at it, is that the marginal *averages* the probability of $$W_2=Ishmael$$ across the different values of $$W_1$$. 

Why is this called a **marginal** distribution? If we think about the table above, the marginal probabilities over the two random variables, can be written in the margins of the table.


|         |*call*|*me* |*Ishmael*|
|---      |---|---|---|
| *call*  |  0.25 |0.125|0.125| 0.5
| *me*    |   0.125 |0.0625|0.0625| .25
|*Ishmael*|  0.125 |0.0625|0.0625| .25
|         | 0.5 | 0.25 | 0.25

We have seen that from the point of view of scoring, the marginal probability of some outcome is simply the probability of that event summing over all the joint states that contain the event. What about from the perspective of sampling? From the perspective of sampling, a marginal distribution simply **forgets** the value of the random variables one isn't interested in.

## Conditional Distributions

The other most important operation of probability theory is *conditioning*. Conditioning refers to a form of hypothetical reasoning where we ask about the probability distribution over some (set of) random variables, assuming some other fact holds. For instance, we might ask what the probability distribution is over $$W_2$$ **given** that $$W_1=call$$. We write the conditional distribution $$P(X \mid Y=y)$$. In general, the part of the conditional distribution to the right of the conditioning bar, the *conditioner* can be any predicate that we require to be true. 

For discrete random variables, conditioning is defined as follows:

$$\Pr(X=x | Y=y) = \frac{\Pr(X=x,Y=y)}{\sum_{x^{\prime} \in X} \Pr(X=x^{\prime},Y=y)}$$

We can think of conditioning as a two step process. First, we get the subset of joint states where the conditioner is true. We then renormalize these states so that they are a probability distribution again by dividing through by the marginal probability of the conditioner. One can think of conditioning as "zooming in" on the part of the joint space we are interested in (the part where the conditioner is true) and then making the result a probability distribution by renormalizing so things add to $$1$$ again. In terms of our table:

|         |*call*|*me* |*Ishmael*|
|---      |---|---|---|
| *call*  |  0.25 |0.125|0.125| 0.5
| *me*    |   0.125 |0.0625|0.0625| .25
|*Ishmael*|  0.125 |0.0625|0.0625| .25
|         | 0.5 | 0.25 | 0.25

Suppose that we want to ask about the conditional distribution $$P(W_1 \mid W_2=Ishmael)$$. Here is just the part of the marginal that we care about.


|         |*call*|*me* |*Ishmael*|
|---      |---|---|---|
| *call*  |  - |-|0.125| 
| *me*    |   -|-|0.0625|
|*Ishmael*| - |-|0.0625| 
|         | - | - | 0.25

Renormalizing we get.

|         |*call*|*me* |*Ishmael*|
|---      |---|---|---|
| *call*  |  - |-|0.5| 
| *me*    |   -|-|0.25|
|*Ishmael*| - |-|0.25| 

Note that in this case, $$P(W_1 \mid W_2=Ishmael) = P(W_1)$$. This is a general consequence of the **independence** of the random variables $$W_1$$ and $$W_2$$ in our joint distribution. To see this note that if $$X$$ and $$Y$$ are independent.

$$\Pr(X=x \mid  Y=y) = \frac{\Pr(X=x,Y=y)}{\sum_{x^{\prime} \in X} \Pr(X=x^{\prime},Y=y)}=\frac{\Pr(X=x)\Pr(Y=y)}{\sum_{x^{\prime} \in X} \Pr(X=x^{\prime})\Pr(Y=y)}=\frac{\Pr(X=x)\Pr(Y=y)}{\Pr(Y=y)}=\Pr(X=x)$$ In fact, another way to write the definition of independence is. 

$$\Pr(X=x \mid Y=y)=\Pr(X=x)\ \forall y$$

# The Chain Rule

Our definitions of conditional and marginal probabilities give rise to an important identity known as the *chain rule*. The chain rule says that we can pick **any** ordering on our random variables, and the joint distribution is the product of the following sequence of conditional distributions. 

$$\begin{align}\Pr(W^{(1)}=w^{(1)}, W^{(2)}=w^{(2)}, ..., W^{(n)}=w^{(n)})
&=&\Pr(W^{(n)}=w^{(n)}\mid W^{(1)}=w^{(1)}, ..., W^{(n-1)}=w^{(n-1)})\\
&\times&\Pr(W^{(n-1)}=w^{(n-1)} \mid W^{(1)}=w^{(1)}, ..., W^{(n-2)}=w^{(n-2)})\\
&\times&...\\
&\times&\Pr(W^{(2)}=w^{(2)} \mid W^{(1)}=w^{(1)})\\
&\times&\Pr(W^{(1)}=w^{(1)})
\end{align}$$

In particular, if I have a joint distribution over two variables, say a corpus $$C$$ (out of the space of possible corpora $$\mathbf{C}$$) and some model parameters $$\theta$$ I can use the chain rule to write the distribution like so:

$$\Pr(\mathbf{C}=C,\Theta=\theta)=\Pr(\mathbf{C}=C \mid \Theta=\theta)\Pr(\Theta=\theta)$$

or, using the slightly less precise notation,

$$\Pr(C,\theta)=\Pr(C\mid\theta)\Pr(\theta)$$

Note that the first term here, $$\Pr(C \mid \theta)$$, is just the likelihood that we have been working with. What is this second term $$\Pr(\theta)$$?


# Generalization and Overfitting

We saw above that when we restricted the probability of particular words to just the words that appeared in our toy corpus sample, we got much higher likelihoods. This, in turn, turned out to be a special case of the general principle of maximal likelihood, which, for  categorical BOW models dictates that we should set the probability of each word proportional to its empirical frequency divided by the total number of word (tokens). 

However, there is one problem with this approach. Suppose, like in the toy example above, our corpus consists of nothing more than repeated instances of the sentence *Call me Ishmael*. Under the principle of maximum likelihoood we will set $$\Pr(Call)=\frac{1}{3}$$, $$\Pr(me)=\frac{1}{3}$$, and $$\Pr(Ishmael)=\frac{1}{3}$$. This will provide very good fit to the particular corpus we are looking at $$C$$. However, it will not, in general, **generalize** well to new data. For example, if we tried to use this model to score another, new sentence, such as *Call me Fred* it would assign this sentence&mdash;or any other sentence involving a new word&mdash;probability $$0$$. 

In fact, this is a general problem not just with maximum likelihood estimation, but with any technique for finding good models in some space of models known as *overfitting*. Our fundamental goal is to find good models for natural language sentence structure. As we have argued no finite set of sentences is a good model for natural langauges like English. Whatever distribution we define over the set of English sentences, must place some probability mass on an infinite set of sentences. 

However, we have also seen that any **corpus** must be inherently finite and any *inductive principle*, such as the principle of maximum likelihood, for choosing from our set of possible models using a particular corpus risks "paying too much attention" to the particular forms in the corpus, at the expense of forms that aren't in the corpus merely by accident. 

In some deep sense, a model which simply **memorized** the exact corpus it was given could assign probability $$1$$ to that dataset, and only that dataset, but, of course, such a model could never account for any new data. 

Researchers have developed many different theoretical approaches to formalizing and studying the problem of what it means to choose a model that is "good" with respect to some dataset from some class of models (e.g., risk minimization, Bayes, minimum description length, PAC-learning, learnability in the limit, and others). 

The twin problems of generalizing well to new data and avoiding overfitting the data you have observed are a core problem addressed in all frameworks. At some level of abstraction, all approaches have adopted a similar solution, which can be schematized as follows if our model is indexed by $$\theta$$.

$$Q(\theta;C) = \mathcal{f}(\mathcal{F}(\theta;C), \mathcal{S}(\theta))$$

Where $$Q(\theta;C)$$ is the overall quality of the hypothesis given the corpus $$C$$, $$\mathcal{F}(\theta;C)$$ is some measure of the fit to the corpus, such as the likelihood, and 
$$\mathcal{S}(\theta)$$ is some measure of the *simplicity*, *elegance* or *plausibility* of the hypothesis **independent** of the data, and $$\mathcal{f}$$ is some function which combines the fit to the data and the simplicity measure. 

The simplicity measure $$\mathcal{S}(\theta)$$ has many different formulations: it is sometimes called *smoothing*, *regularization* or *prior probability*. But its function is always the same: to penalize implausible or overly-complex models to avoid overfitting the data. We will now take some time to look at some approaches in more detail. First, let's look a bit more closely at the space of hypotheses we are interested in.

# The Simplex: $$\Theta$$

We have been talking about the space of models in the class of categorical BOW models. In this class, our models are indexed or parameterized by probility vectors over $$k$$ outcomes. Before talking more about simplicity or plausibility measures on  $$\Theta$$, it is useful to see how this space can be visualized. In $$\mathbb{R}^2$$, where does the space of probability vectors fall? What about in $$\mathbb{R}^3$$?

[Simplex](https://github.com/bergen/foundations-computational-linguistics/blob/master/simplex-r3.png)

We often think about particular likely or unlikely values in this space. With three dimensional probability vectors we can visualize this using a heat map over the simplex. 


[Dirichlet Simplex](https://github.com/bergen/foundations-computational-linguistics/blob/master/dirichlet.png)

# Additive Smoothing

We want to find a way of placing some simplicity measure on our space of possible hypotheses $$\theta \in \Theta$$ such that we avoid overfitting our dataset. One way of thinking about this is that we wish to avoid extreme probability distributions that set lots of things to $0$ and a few things to high probabilities&mdash;in other words, we might assume some our simplicity/plausibility assumption is that we expect to see all of our vocabulary used at one point or another. 

One way of doing this is *Laplace* or *additive smoothing*. To do *Laplace* smoothing, we add some number $$n$$ (often $$1$$) to the count of each word in our vocabulary. Sometimes these numbers are called *pseudocounts*, we can think of them as the (imaginary) number of times we have seen each word **before** we observed our corpus $$C$$. 

One way of understanding Laplacian smoothing is that it makes the uniform distribution $$\theta_w = \frac{1}{\mid V \mid}$$ more likely *a priori* than other possible outcomes, and prevent any outcome from assigning $$0$$ probability to any member of the vocabulary $$V$$.

# Hierarchical Generative Models

Laplacian smoothing is intuitive, but it also seems somewhat arbitrary, is there a more general framework for understanding what we are doing by adding in pseudocounts to our model? The Bayesian way of approaching this question (which is not the only way) is to assume that when we come to an inference process, like choosing a good parameterization of our categorical BOW model, we come with **prior beliefs**. For instance, we may believe that it is unlikely that any vocabulary items will have extremely low probability, or that our distribution will be that skewed away from the uniform distribution.

We can encode such beliefs using a *prior distribution* over the parameters $$\theta$$. Earlier, we considered $$\Theta$$ to simply be the space of possible (parameterizations of) models. Now, however, we consider $$\Theta$$ to be a **random variable** and we define a distribution over it: $$\Pr(\Theta = \theta)$$. Now given some distribution over $$\vec{\theta}$$ we can define a *hierarchical model*.

$$\begin{align}
\vec{\theta} &\sim& \mathrm{somedistribution}()\\
w^{(1,1)}, ..., w^{(1,n_1)},..., w^{(|C|,1)}, ..., w^{(|C|,n_{|C|})} \mid \vec{\theta} &\sim& \mathrm{categorical}(\vec{\theta})\\
\end{align}$$

We can also write this model using probability notation like so.

$$\Pr(C,\theta) = \Pr(C|\theta)\Pr(\theta)$$

Such a model is called a *hiearchical generative* model, since it spells out how a corpus is sampled in steps from top to bottom. 

# Dirichlet distributions

A standard probability distribution used on the simplex is the *Dirichlet distribution*. The Dirichlet distribution can be defined as follows. 

$$p\left(\theta_{1},\ldots ,\theta_{K};\alpha _{1},\ldots ,\alpha _{K}\right)= \frac{1}{B(\vec{\alpha})}\prod _{i=1}^{K}\theta_{i}^{\alpha _{i}-1}$$

Where $$B(\vec{\alpha})$$ is just the normalizing constant that makes the distribution sum to (actually integrate to) $$1$$. 

In other words. 

$$B(\vec{\alpha})=\int_{\Theta} \prod _{i=1}^{K}\theta_{i}^{\alpha _{i}-1}$$

Note that here we are using integration from multivariate calculus to "add up" all of the probability mass (actually density) in the simplex $$\Theta$$. Using some (non-trivial) calculus, it can be shown that. 

$$B(\vec{\alpha})=\frac{\prod_{i=1}^{K} \Gamma(\alpha_i)}{\Gamma(\sum_{i=1}^K \alpha_i)}$$

Where we are using the *gamma function* $$\Gamma(\cdot)$$, which can be thought of as a continuous generalization of the factorial function, in particular, for integer values $$\Gamma(n) = (n-1)!$$.

So we can write the entire Dirichlet distribution as 

$$p\left(\theta_{1},\ldots ,\theta_{K};\alpha _{1},\ldots ,\alpha _{K}\right)= \frac{\Gamma(\sum_{i=1}^K \alpha_i)}{\prod_{i=1}^{K} \Gamma(\alpha_i)} \prod _{i=1}^{K}\theta_{i}^{\alpha _{i}-1}$$

The crucial thing about the Dirichlet distribution, though, is that the probability that it assigns to $$\vec{\theta}$$ is proportional to a term that looks very similar to our categorical likelihood.

$$p\left(\theta_{1},\ldots ,\theta_{K};\alpha _{1},\ldots ,\alpha _{K}\right) \propto \prod _{i=1}^{K}\theta_{i}^{\alpha _{i}-1}$$

Let's look at some of its properties.

[Different Dirichlet distributions](https://github.com/bergen/foundations-computational-linguistics/blob/master/400px-Dirichlet.png)

How can we define a sampler for a Dirichlet distribution?

```
(defn normalize [params]
  (let [sum (apply + params)]
    (map (fn [x] (/ x sum)) params)))

(defn sample-gamma [shape scale]
  (apply + (repeat (fn [] (- (Math/log (rand)))) shape)))

(defn sample-dirichlet [pseudos]
  (let [gammas (map (fn [sh]
                     (sample-gamma sh 1))
                pseudos)]
    (normalize gammas)))

(sample-dirichlet (list 1 1 1))
```

# Dirichlet-Categorical Distributions

Now with  Dirchlet distribution defined in this way, we can define a new kind of random variable, called the *Dirichlet-categorical distribution*. This is a single random variable which encapsulates the hierarchical sampling process we defined above. In other words, we define the following hierarchical generative model.

$$\begin{align}
\vec{\theta} &\sim& \mathrm{Dirichlet}(\vec{\alpha})\\
w^{(1,1)}, ..., w^{(1,n_1)},..., w^{(|C|,1)}, ..., w^{(|C|,n_{|C|})} \mid \vec{\theta} &\sim& \mathrm{categorical}(\vec{\theta})\\
\end{align}$$

Or written in probability notation:

$$\Pr(C,\theta \mid \vec{\alpha}) = \Pr(C\mid \theta, \vec{\alpha})\Pr(\theta \mid \vec{\alpha})$$

In fact, given our definition of the hierarchical generative process above, the probability of the corpus $$\Pr(C\mid \theta, \vec{\alpha})=\Pr(C\mid \vec{\theta})$$ doesn't depend on $$\vec{\alpha}$$ once we know $$\theta$$, that is $$C$$ is *conditionally independent* of $$\vec{\alpha}$$ given $$\vec{\theta}$$.

Notice that the important thing about the Dirichlet-categorical model is that the probability vector $$\vec{\theta}$$ is drawn **once** and **reused** throughout the whole sampling process over words. How can we write this in Clojure? We need to somehow produce a function which can sample from our vocabulary $$V$$ using some random draw of $$\vec{\theta} \sim \mathrm{categorical}(\vec{\alpha})$$. We can do this using a *closure*.

```
(defn make-Dirichlet-categorical-sampler [vocabulary pseudos]
  (let [theta (sample-dirichlet pseudos)]
    (fn []
      (sample-categorical 
       vocabulary 
       theta))))

(def sample-Dirichlet-categorical 
  (make-Dirichlet-categorical-sampler '(Call me Ishmael) '(1 1 1)))

(list-unfold sample-Dirichlet-categorical 10)

```

What about scoring for our hierarchical model? Now we run into a problem. We can easily score a corpus for any **particular** value of $$\vec{\theta}$$, but our hierarchical model gives us a **joint distribution** for both $$\vec{\theta}$$ and $$C$$, given $$\vec{\alpha}$$, not a particular value of $$\theta$$. To know the score of our corpus, then, we need to compute the **marginal distribution** of the corpus $$C$$ marginalizing away $$\theta$$. In other words. 

$$\begin{align}\Pr(C|\vec{\alpha}) &=& \int_{\Theta} \Pr(C, \vec{\theta} \mid \vec{\alpha})\\
&=& \int_{\Theta} \Pr(C \mid \vec{\theta})\Pr(\vec{\theta} \mid \vec{\alpha})\\
&=&{\int_{\Theta}}\prod_{w^\prime \in V}\theta_{w^\prime}^{n_{w^\prime}}{\frac {\Gamma \left(\sum_{w^\prime \in V}\alpha _{w^\prime}\right)}{\prod _{w^\prime \in V} \Gamma (\alpha _{w^\prime})}}\prod_{w^\prime \in V}\theta_{w^\prime}^{\alpha _{w^\prime}-1}\\
&=&{\frac {\Gamma \left(\sum_{w^\prime \in V}\alpha _{w^\prime}\right)}{\prod _{w^\prime \in V} \Gamma (\alpha _{w^\prime})}}{\int_{\Theta}}\prod_{w^\prime \in V}\theta_{w^\prime}^{n_{w^\prime}}\prod_{w^\prime \in V}\theta_{w^\prime}^{\alpha _{w^\prime}-1}\\
&=&{\frac {\Gamma \left(\sum_{w^\prime \in V}\alpha _{w^\prime}\right)}{\prod _{w^\prime \in V} \Gamma (\alpha_{w^\prime})}}{\int_{\Theta}}\prod_{w^\prime \in V}\theta_{w^\prime}^{[n_{w^\prime}+\alpha_{w^\prime}]-1}\\
&=&\frac{\Gamma(\sum_{w^\prime \in V} \alpha_{w^\prime})}{\prod_{w^\prime \in V} \Gamma(\alpha _{w^\prime})}
\frac{\prod _{w^\prime \in V} \Gamma ([n_{w^\prime}+\alpha_{w^\prime}])}{\Gamma \left(\sum_{w^\prime \in V}[n_{w^\prime}+\alpha_{w^\prime}]\right)}\end{align}$$

This is a complicated expression, but the core idea is that when we wish to know the score of a corpus, and there are *latent* random variables, such as the variable $$\theta$$, we must **marginalize** over these random variables.


# Bayesian Inference

The usefulness of hierarchical probabilistic models is how they can be used together with the operation of probabilistic conditionining to derive another approach to model comparison, selection, and parameter fitting: *Bayesian inference*.

The basic idea of Bayesian inference is that we treat the problem of fitting a model as one of computing a conditional **distribution** over the models in our class. We have seen how we can think of models in the set of categorical distributions as **indexed** by particular vectors $$\theta \in \Theta$$. In maximum likelihood estimation, we thought of $$\theta$$ strictly as a **parameter**, that is, as a fixed, given part of a model. However, now that we have introduced a distribution on $$\theta$$, we can instead think of $$\theta$$ as a **random variable** itself, and consider the conditional distribution $$\Pr(\Theta=\vec{\theta} \mid \mathbf{C}=C, \vec{\alpha})$$. Since we have defined a joint distribution $$\Pr(\Theta=\vec{\theta}, \mathbf{C}=C, \vec{\alpha})$$, we know that we can compute this conditional distribution by our two-step procedure. What does this look like?

## Bayes' Rule

Combining the definition of conditional probability with the chain rule, we end up with an important special-case law of probability known as *Bayes' Rule*: 

$$\Pr(H=h \mid D=d)=\frac{\Pr(D=d \mid H=h)P(H=h)}{\sum_{h'\in H} \Pr(D=d \mid H=h')\Pr(H=h')}=\frac{\Pr(D=d \mid H=h)\Pr(H=h)}{\Pr(D)}$$

Note that this is just the definition of conditional probability with $$\Pr(D=d \mid H=h)P(H=h)$$ substituted for $$\Pr(D=d, H=h)$$ via the chain rule.  Bayes' rule is often written in this form with $$H$$ standing for a random variable representing some hypothesis, for instance the set of possible categorical distributions $$\Theta$$ and $$D$$ standing for some *data* like a corpus of utterances $$C$$.

The term $$\Pr(H=h \mid D=d)$$ is known as the *posterior distribution* over the hypothesis given the data. The term $$\Pr(D=d \mid H=h)$$ is known as the *likelihood of the hypothesis* (or less accurately, but more often, likelihood of the data), and the term $$\sum_{h'\in H} \Pr(D=d \mid H=h')\Pr(H=h')$$ is known as the *evidence* or more often *marginal likelihood* of the data. Note that  $$\sum_{h'\in H} \Pr(D=d \mid H=h')\Pr(H=h')=\sum_{h'\in H} \Pr(D=d, H=h')$$ by the chain rule, so this denominator is just the marginal probability of the data (marginalizing over all hypotheses). 

We  can use Bayes' Rule to write our current model like this:

$$\Pr(\Theta=\vec{\theta} \mid \mathbf{C}=C, \vec{\alpha})=\frac{\Pr(\mathbf{C}=C \mid \Theta=\vec{\theta}, \vec{\alpha})\Pr(\Theta=\vec{\theta}\mid\vec{\alpha})}{\int_{\Theta} \Pr(\mathbf{C}=C \mid \Theta=\vec{\theta},\vec{\alpha})\Pr(\Theta=\vec{\theta}\mid \vec{\alpha})}$$

Note two things. First, here we have replaced the sum in the bottom with an integral. This is because the random variable $$\Theta$$ is continuous. In the case of continuous random variables, we can think of integration as the corresponding operation to summation.

Second, notice that the way that in Bayes' rule, we replace the joint probability $$\Pr(\Theta=\vec{\theta}, \mathbf{C}=C \mid \vec{\alpha})$$ in the numerator of conditional probability with the chain-rule decomposition $$\Pr(\mathbf{C}=C \mid \Theta=\vec{\theta}, \vec{\alpha})\Pr(\Theta=\vec{\theta} \mid \vec{\alpha})$$. Note that this is **exactly the form of our hierarchical generative model**. In other words, the denominator in Bayes' rules is defined by our hierarchical generative model.


# Bayesian Inference for the BOWs Model

Recall that our likelihood was given by the following:

$$\Pr(C \mid \vec{\theta}) = \prod_{w^\prime \in V} \theta_{w^\prime }^{n_{w^\prime }}$$

And a Dirichlet prior over $$\theta$$ with pseudocounts $$\alpha$$ is given by the following:

$$\Pr(\vec{\theta} \mid \vec{\alpha})={\frac {\Gamma \left(\sum_{w^\prime \in V}\alpha _{w^\prime}\right)}{\prod _{w^\prime \in V} \Gamma (\alpha _{w^\prime})}} \prod_{w^\prime \in V}\theta_{w^\prime}^{\alpha _{w^\prime}-1}$$

So the joint probability of our model is given by the following expression.
$$\Pr(C, \vec{\theta}\mid\vec{\alpha})=\Pr(C \mid \vec{\theta})\Pr(\vec{\theta} \mid \vec{\alpha})$$
$$ \propto \prod_{w^\prime \in V} \theta_{w^\prime}^{n_{w^\prime}+\alpha _{w^\prime}-1}$$

Why is Bayes rule important? Note that it has given us another principle for choosing a good model $$\theta \in \Theta$$: the *principle of Bayesian inference*. 

Doing a bit of calculus it isn't hard to show that the resulting probability distribution over $$\theta$$ is.

$$\Pr(\vec{\theta}\mid C, \vec{\alpha})= 
{\frac {\Gamma \left(\sum_{w^\prime \in V}[n_{w^\prime}+\alpha _{w^\prime}]\right)}{\prod _{w^\prime \in V} \Gamma ([n_{w^\prime}+\alpha _{w^\prime}])}}\prod_{w^\prime \in V}\theta_{w^\prime}^{[n_{w^\prime}+\alpha _{w^\prime}]-1}$$

In other words, our posterior distribution over $$\theta$$ is just another Dirichlet distribution, with the pseudocounts updated by the true counts. 

# Using the Bayesian Posterior

With a Bayesian posterior distribution, we have several options regarding how to use the posterior for model selection. Unlike, ML which only provided *point estimates*, Bayesian inference gives us a whole distribution over $$\theta$$ that is, a probability for every point in the space. We can do one of several things:

- Use the *Maximum A Posteriori* (MAP) $$\theta$$.
- Sample a $$\theta$$ and use that.
- Use the *Posterior Predictive Distribution*.


## The Posterior Predictive Distribution

The idea behind the Bayesian *posterior predictive* distribution is that we might not want to commit to a single hypothesis $$\vec{\theta}$$ in our posterior distribution, but instead might want to *average over* all of our posterior values of $$\theta$$.

Imagine that our corpus consisted of $$N$$ words, and this we computed a posterior distribution $$\Pr(\vec{\theta} \mid w^{(1)},...,w^{(N)},\vec{\alpha})$$, based on this posterior distribution, what is the probability that the **next** word, 
 $$W^{(N+1)}$$, takes on value $$w_i$$ (e.g., what is the probability that the next word is "Ishmael"). In other words, what is the probability.
 
$$\Pr(W^{(N+1)}=w_i \mid w^{(1)},...,w^{(N)},\vec{\alpha})$$

Note that this is, once again, a marginal probability marginalizing over $$\theta$$. 

$$\Pr(W^{(N+1)}=w_i \mid w^{(1)},...,w^{(N)},\vec{\alpha}) = \int_{\Theta} \Pr(W^{(N+1)}=w_i \mid \vec{\theta}) \Pr(\vec{\theta} \mid w^{(1)},...,w^{(N)},\vec{\alpha})$$

Notice that the first term in this integral is just $$\theta_{w_i}$$ the probability of $$w_i$$. The second term, is just the posterior probability of $$\theta$$.


$$\Pr(W^{(N+1)}=w_i \mid w^{(1)},...,w^{(N)},\vec{\alpha}) = \int_{\Theta} \theta_{w_i} {\frac {\Gamma \left(\sum_{w^\prime \in V}[n_{w^\prime}+\alpha _{w^\prime}]\right)}{\prod _{w^\prime \in V} \Gamma ([n_{w^\prime}+\alpha _{w^\prime}])}}\prod_{w^\prime \in V}\theta_{w^\prime}^{[n_{w^\prime}+\alpha _{w^\prime}]-1}$$


Using some properties of the $$\Gamma(\cdot)$$ function, it is possible to show that. 

$$\Pr(W^{(N+1)}=w_i \mid w^{(1)},...,w^{(N)},\vec{\alpha}) =
\frac{n_{w_i}+\alpha _{w_i}}{\sum_{w^\prime \in V}[n_{w^\prime}+\alpha _{w^\prime}]}$$

In other words, the probability that the next word is $$w_i$$ is just the pseudocount of $$w_i$$ plus the number of times that you have seen $$w_i$$ before, renormalized.

#### Sequential Sampling

Suppose that I give you a vocabulary and a set of pseudocounts for that vocabulary. You follow the following sampling scheme.

1. Take the set of pseudocounts $$\vec{\alpha}$$ and renormalize it.
2. Sample a word from the resulting probability distribution.
3. If you word was $$w_i$$, add $$1$$ to pseduocount $$\alpha_i$$.
4. Return and repeat step 1 $$N$$ times.

This will give you a sequence of $$N$$ random variables $$W^{(1)},...,W^{(N)}$$.

Compare the following sampling scheme.

1. Draw a parameter vector $$\vec{\theta} \sim \mathrm{Dirichlet}(\vec{\alpha})$$
2. Sample from the distribution categorical $$(\vec{\theta})$$ $$N$$ times.

This will also give you back a sequence of words $$W^{(1)},...,W^{(N)}$$.

These two sequences of random variables have **exactly the same distribution**. To see this, note that what you are doing in the first version is updating your posterior predictive after each sample and then using that to sample the next obversation. In some sense, you are sequentially conditioning on your own sequence of generated observations. 

This sequential sampling process integrates out $$\vec{\theta}$$ incrementally, and is known as the *Pólya urn scheme* representation of the Dirichlet-categorical distribution. 

It will provide us with a convenient way to represent samplers for Dirichlet-categorical distributions. 
