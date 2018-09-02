---
title: Generative Models
---

# Comparing Theories

In the last unit, we saw how we could use formal languages, or sets of strings, as a model of natural language structure. We also introduced the idea of describing natural languages in terms of computational processes such as recognizers and generators. Now we have a framework in which we can plausibly begin to build some models of natural language which captured our original goal of making clear the computational processes that allow us to produce and comprehend utterances, and the hard part begins.

How can we choose between different proposals? What makes one proposal good and another bad? In some cases, we will be able to isolate a single property we think is important in nartural language and show conclusively that some model can't capture it. We used this approach to show that at least for English we needed to use infinite languages as models. The property we isolated was the possibility, in English of adding an unspecified number of prepositional phrases as in *Alice talked to the father of the mother of Bob*. We argued that these structures were *homomorphic* to the formal language $$\{[],[a],[b]\}^*$$, and since this language is **infinite**, no **finite** formal language can be an adequate model of English. Most arguments in linguistics about the goodness or badness of particular models are like this (although typically not as mathematically precise). These arguments rely on isolating a particular property or structure of interest, arguing that natural language (or *some* natural language) has this property, and then arguing that some proposed model of language cannot capture the property.

It is worth considering the sort of reasoning we are using here. Essentially, this argument is about *goodness of fit* to the data. In this case, our formal model---some finite language---cannot fit the data at all. But in general, we might want a more fine-grained measure of goodness of fit to the data, one that isn't all or nothing. For example, in our argument above, we used $$\{[],[a],[b]\}^*$$ as our infinite model of English. But this language is just the set of **all strings** over the vocabulary $$\{a,b\}$$! If you consider a more realistic vocabulary, like the set of all actual English words $$\{mother, father, see, eat, of, brother, ...\}$$, it is easy to see that while the set of **all** strings over that vocabulary must contain English, it isn't a very good model of English, since it contains strings like *furiously green sleep ideas colorless*. Is there a way we can measure how bad it is?

## Evaluation Metrics

Numerical measures of the goodness of particular theories are called *evaluation metrics* in linguistics, and have been studied since the very beginnings of the modern science. In subsequent sections, we will define several different kinds of evaluation metrics, and discover some surprising and beautiful mathematical connections between them. Below we introduce our first, probability. But first an aside on natural language corpora and frequencies.

# Natural Language Corpora

We have seen examples of how we can define formal infinite formal languages like $$[ab]^*$$ using generators and recognizers. In general, we argued that English cannot be modeled by a finite formal language. Once we make the move to infinite languages (defined implicitly using computer programs) and we wish to come up with numerical measures of goodness of fit, we run into two problems. First, we do not have access to every well-formed sentence of English. Any actual sample of natural language sentences, say the set of sentences in *Moby Dick*, must be **finite**.

Second, real samples of natural language can contain repeated sentences. By definition, formal languages do not contain repeats For example, the language $${[ab}}^*$$ contains only one copy of each unique string in the language, i.e., $$\{[], [ab], [abab], [ababab], ...\}$$. This is a feature of this idealization rather than a bug, since we would like our formal languages to be models of **well-formed** strings in natural language. However, if we wish to compare to numerically to actual language data, we will need to define what that means. To do this we will introduce the (formal) notion of a *corpus*.

For now, we will define a corpus $$\mathbf{C}$$ as a finite *multi-set* of strings. A multi-set is simply the set theoretic name of a set that is allowed to have multiple distinguished copies. For example, the set of sentences in *Moby Dick* is a multiset. The first few strings in this set are:

> Call me Ishmael . 

> Some years ago — never mind how long precisely — having little or no money in my purse , and nothing particular to interest me on shore , I thought I would sail about a little and see the watery part of the world .

> It is a way I have of driving off the spleen and regulating the circulation .

> Whenever I find myself growing grim about the mouth; whenever it is a damp , drizzly November in my soul ; whenever I find myself involuntarily pausing before coffin warehouses , and bringing up the rear of every funeral I meet ; and especially whenever my hypos get such an upper hand of me , that it requires a strong moral principle to prevent me from deliberately stepping into the street , and methodically knocking people’s hats off—then , I account it high time to get to sea as soon as I can . 

> This is my substitute for pistol and ball . 

> With a philosophical flourish Cato throws himself upon his sword ; I quietly take to the ship . 

> There is nothing surprising in this . 

> If they but knew it , almost all men in their degree , some time or other, cherish very nearly the same feelings towards the ocean with me .

Note that here we have *tokenized* this text. That is, we have put spaces between things like words and punctuation and other symbols that we would like to distinguish from one another in a formal model of this text.


## Probability of the Corpus or Likelihood of the Model

A natural way of defining a goodness-of-fit score for a model is by asking what *probability* it assigns to a corpus, a quantity also sometimes called the *likelihood* of the model. How can we define probability distributions for specific models. 


# (Probabilistic) Generative Models

One way of specifying the probability of some corpus is by defining a *probabilistic generative model*. This is simply a generator whose is behavior is random, that is a model which *samples* strings from some probability distribution. Recall our definition of a generator for the language $$\{[ab]\}^*$$.

```
(defn generate-ab* [n]
  (if (= n 0)
      '()
      (concat '(a b) (generate-ab*  (- n 1)))))


(generate-ab*  10)
```      

Recall that in this code we left $$n$$ unspecified, a *nondeterministic choice*. One way to define a probability distribution is to replace nondeterministic choice with *random choice*. How can we do this? First, let's define a procedure called "flip" which flips a fair coin.

```
(defn flip []
  (if (> (rand 1) 0.5)
      true
      false))
(flip)
```

Now we can change "generate-abn" by replacing the stopping condition with a random coin flip.

```
(defn sample-ab* []
  (if (= (flip) true)
      '()
      (concat '(a b) (sample-ab*))))
(sample-ab*)
```


Note that we have changed the name to begin with "sample-". Such a probabilistic generator is known as a *sampler* and we will often use this naming convention when we write them. We can also write the probabilistic equivalent to *recognizer* for this language. Recall our original recognizer function.

```
(defn prefix? [pr str]
  (if (> (count pr) (count str))
      false
      (if (empty? pr)
          true
          (if (equal? (first pr) (first str))
              (prefix? (rest pr) (rest str))
              false))))

(defn lang-ab*? [str]
    (if (empty? str) 
        true
        (if (prefix? '(a b) str)
            (lang-ab*? (rest (rest str)))
            false)))

(lang-ab*? '(a b a b))
```

What is the probabilistic equivalent of a recognizer? It is a function that returns not just whether a string is a language or not, but the **probability** of the string under the generative model. We call such functions *scoring functions*.

```
(defn score-ab* [str]
    (if (empty str) 
        0.5
        (if (prefix? '(a b) str)
            (* 0.5 (score-ab* (rest (rest str))))
            0)))

(score-ab* '(a b a b))
```

We will often use this naming convention "score-" for scoring functions. Note that what this function does is score a string under the generative model above.

## Corpus Generators and Scorers

With language samplers and scorers defined, we are now in a position to evaluate the *probability* or *score* of a dataset, or *likelihood* of the model which is a measure of well the model matches the *corpus frequencies* of the corpus.

```
(defn sample-corpus [generator size]
  (if (= size 0)
      '()
      (cons (generator) (sample-corpus generator (- size 1)))))

(sample-corpus sample-ab* 4)

(defn sample-corpus-random [generator]
  (if (flip)
      '()
      (cons (generator) (sample-corpus-random generator))))
    
(sample-corpus-random sample-ab*)

(def my-corpus (list '(a b a b) '() '(a b) '(a b a b a b)))

(defn score-corpus [scorer corpus]
  (if (empty? corpus)
      1.0
      (* (scorer (first corpus)) (score-corpus scorer (rest corpus)))))

(score-corpus score-ab* my-corpus)
  
```

There is a close relationship between samplers and scorers. In particular, any corpus which is sampled by a generator can be scored by a scorer. The score of that corpus is simply the probably that the generator *would* have generated it in the first under random chance. This connection is absolutely crucial to understanding how probabilities can be used for learning and inference, as we will see in upcoming lectures. 

