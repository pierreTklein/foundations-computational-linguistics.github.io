---
layout: chapter
title: Nonparametric  Models of Lexicon Learning
description: Nonparametric models of lexicon learning
---

In this section, we discuss the ways in which `DPmem` can be used to
provide uniform accounts of various aspects of phonological lexicon
learning via what we call *lexical memoization*.

# Morphemes as Unstructured Sequences of Phones

> Goldwater, S., Griffiths, T. L., and Johnson, M. (2009). A Bayesian
> framework for word segmentation: Exploring the effects of
> context. Cognition, 112:21–54

The simplest model of the phonological lexicon treats morphemes as
unstructured sequences of phones. We can use `DPmem` to generate an
unbounded inventory of such morphemes via lexical memoization.

~~~
(define phone-inventory '(a e i o u p t k b d g s ch f z gh v))

(define (sample-phone)
  (uniform-draw phone-inventory))

(define sample-morpheme
	(DPmem 1.0
		(lambda ()
			(repeat (poisson 5.0) sample-phone))))

(sample-morpheme)
~~~

This model of the lexicon can, in turn, be used to define a model of
morpheme segmentation. We simply generate sequences of morphemes using
`sample-morpheme`.

~~~
(define phone-inventory '(a e i o u p t k b d g s ch f z gh v))

(define (sample-phone)
  (uniform-draw phone-inventory))

(define sample-morpheme
	(DPmem 1.0
		(lambda ()
			(repeat (poisson 5.0) sample-phone))))

(define sample-utterance
	(mem (lambda (utterance)
		(repeat (poisson 5.0) sample-morpheme))))

(sample-utterance 'u1)
~~~

Using `query`, we can condition this model on unsegmented sequences of
phones to acquire a lexicon of reusable morphemes.


~~~
(define (factor-noisy-equal? x y)
	(factor (if (equal? x y)
		0
		(log 0.0001))))

(define (morpheme-equal? m1 m2)
	(map factor-noisy-equal? m1 m2))

(define (utterance-equal? u1 u2)
	(map morpheme-equal? u1 u2))

(define samples
	(mh-query
	200 200
	
	(define phone-inventory '(a e i o u p t k b d g s ch f z gh v))

	(define (sample-phone)
		(uniform-draw phone-inventory))

	(define sample-morpheme
		(DPmem 1.0
			(lambda ()
				(repeat 3 sample-phone))))

	(define sample-utterance
		(mem (lambda (utterance)
			(repeat 2 sample-morpheme))))

	(sample-morpheme)

	(and
		(utterance-equal? '((t a t) (s a s)) (sample-utterance 'u1))
		(utterance-equal? '((t a t) (s a s)) (sample-utterance 'u2))
		(utterance-equal? '((t a t) (s a s)) (sample-utterance 'u3)))))

(hist samples "Lexical Items")

~~~

Note that we have made a change to the generative model above: we have
fixed the lengths of each morpheme to be $$3$$ and each utterance to
be $$2$$. In addition, we also use the function `utterance-equal?` to
compare generated utterances to the input data. Why have we made these
changes?

#  Distributions over Phone Inventories

The models in the last section learn a distribution over morphemes
based on a Dirichlet process using `DPmem`; however, they treat
individual morphemes as completely unstructured sequences of phones
drawn uniformly at random from the underlying phone inventory &mdash;
essentially assuming no phonotactic constraints at all. A first step
in improving this model is to allow the distribution over phones to be
non-uniform and specify a prior over it, allowing the model to represent
differential phone frequencies. One way to do this is to put a
Dirichlet prior on the phone inventory.

~~~
(define phone-inventory '(a e i o u p t k b d g s ch f z gh v))
(define phone-weights (dirichlet (make-list (length phone-inventory) 1)))

(define (sample-phone)
  (multinomial phone-inventory phone-weights))

(define sample-morpheme
	(DPmem 1.0
		(lambda ()
			(repeat (poisson 5.0) sample-phone))))

(define sample-utterance
	(mem (lambda (utterance)
		(repeat (poisson 5.0) sample-morpheme))))

(sample-utterance 'u1)
~~~

Another way we can achieve a similar effect is by using `DPmem` with a
uniform base measure.

~~~
(define phone-inventory '(a e i o u p t k b d g s ch f z gh v))

(define sample-phone
	(DPmem 1.0
		(lambda ()
			(uniform-draw phone-inventory))))

(define sample-morpheme
	(DPmem 1.0
		(lambda ()
			(repeat (poisson 5.0) sample-phone))))

(define sample-utterance
	(mem (lambda (utterance)
		(repeat (poisson 5.0) sample-morpheme))))

(sample-utterance 'u1)
~~~

#  N-gram-Based Models of Phonotactics

> Goldwater, S., Griffiths, T. L., and Johnson, M. (2009). A Bayesian
> framework for word segmentation: Exploring the effects of
> context. Cognition, 112:21–54

The preceding models added a small amount of phonotactic structure
since they could account for differences in the base probability of
phones. However, they did not account for any sequential structure in
the form of words. One way to add sequential structure is by using an
n-gram model.

Earlier in the tutorial we saw n-gram models. These are simple Markov
model where the probability of emitting a symbol depends on the
$$n-1$$ previous symbols. A simple bigram model of phonotactics can be
written in Church as follows.


~~~
(define phone-inventory '(a e i o u p t k b d g s ch f z gh v))

(define context->next-phone-distribution
	(mem 
		(lambda (context)
			(DPmem 1.0 (lambda () (uniform-draw phone-inventory))))))
   
(define context->next-phone
	(lambda (context)
		(sample (context->next-phone-distribution context))))
   
(define (unfold-N N expander memory)
	(if (< N 1)
		'()
		(let ((next-symbol (expander memory)))
			(pair next-symbol
				(unfold-N (- N 1) 
					expander
					next-symbol)))))

(define sample-morpheme
	(DPmem 1.0
		(lambda ()
			(unfold-N (poisson 5.0) context->next-phone '()))))

(define sample-utterance
	(mem (lambda (utterance)
		(repeat (poisson 5.0) sample-morpheme))))

(sample-utterance)
~~~

Here we have set up a hierarchical bi-gram model with a Dirichlet
prior on each of the conditional distributions $$P(p_i | p_{i-1})$$.
This model is essentially a simplified version of the second model
described in the paper referenced at the beginning of this section.

# `DPmem` Based Back-off

> S. Goldwater, T. L. Griffiths, and M. Johnson (2006). Interpolating
> between types and tokens by estimating power-law generators. In
> Advances in Neural Information Processing Systems 18.

> Y. W. Teh. (2006). A hierarchical Bayesian language model based on
> Pitman-Yor processes. In Proceedings of the 21st International
> Conference on Computational Linguistics and 44th Annual Meeting of
> the Association for Computational Linguistics.

While bi-gram models like those in the last section are useful, in
practice we can achieve much more accurate phonotactic predictions
using a higher-order n-gram model where each phone is conditioned on
more than just the preceding symbol. However, conditioning on more
than one preceding word raises an important problem. The number of
word sequences of length $$K$$ is $$|inventory|^K$$. Even for
moderately sized inventories the number of possible sequences for
which we must infer a distribution quickly becomes unmanageable as we
increase the order of our model. In a normal data set we will never
have observed most of the sequences we would like to condition on. How
can we estimate the transition distribution?

One standard solution to this problem is to employ *back-off*.
Suppose we want to generate the next symbol conditional on a context
of length $$K$$: $$p_{i-K} p_{i-(K-1)} ... p_{i-1}$$, but we have
never witnessed this sequence before. In this case, we back-off to the
sequence $$p_{i-(K-1)} p_{i-(K-2)} ... p_{i-1}$$ and try to generate
the next symbol from the distribution associated with this context. If
this context itself has not been witnessed before, we back-off to the
next shorter context. Eventually we will back off to the empty
context, which is equivalent to generating the word based on its
unigram probability.

In traditional back-off models each of the context-lengths of interest
is estimated in advance from some data, and the prediction for the
next word is often modeled as a linear interpolation of all the context
lengths. However, using Dirichlet processes it is possible to define
a Bayesian generative model which captures this notion of back-off as
part of the generative process itself.

~~~
(define phone-inventory '(a e i o u p t k b d g s ch f z gh v))
(define max-ngram-order 3)
   
   (define (kth-order-markov-memory K)
     (lambda (history update)
       (if (< (length history) K)
           (pair update history)
           (pair update (take history (- (length history) 1))))))
   
   (define context->next-phone-distribution
     (mem 
      (lambda (context) 
        (DPmem 10
         (lambda ()
           (if (null? context)
               (uniform-draw phone-inventory)
               (context->next-phone (rest context))))))))
   
   (define context->next-phone
     (lambda (context)
       (sample (context->next-phone-distribution context))))
   
   (define (unfold-N N transition update-memory memory)
     (if (< N 1)
         '()
         (let ((next-symbol (transition memory)))
             (pair next-symbol
                   (unfold-N (- N 1) 
                             transition
                             update-memory
                             (update-memory memory next-symbol))))))
   
   (unfold-N 7 context->next-phone (kth-order-markov-memory max-ngram-order) '())
~~~

Here we have defined a new kind of `unfold`. In addition to taking the
normal transition function as an argument, this version of `unfold`
also takes a procedure called `update-memory` which is responsible for
maintaining the conditioning context through the recursion. In this
case we use the memory-updater called `kth-order-markov-memory`. This
procedure takes two arguments. It takes the current context, and the
symbol that was just generated conditional on this context. It
maintains a context of length $$K$$ by adding the most recent symbol
to the context and stripping off the oldest.

This procedure allows us to maintain a history of length $$K$$ for
generating each next symbol. How is back-off implemented? Our
transition function is called `context->next-phone`. It simply
retrieves the `mem`'d Dirichlet process for that context and samples a
symbol it. The procedure `context->next-phone-distribution` constructs
the relevant conditional distribution. It is this procedure which
implements the back-off. Notice first that this is a procedure which
returns another procedure&mdash;which has been `DPmem`'d. For each
context we have a restaurant which will keep track of which symbols
have been observed in that context. What is the base measure for this
restaurant? The base measure has two cases. If the context is empty
then the base measure simply samples uniformly from the
inventory. However, if the context is not empty, the base measure is
a ''recursive call to the same function with the backoffed context''.

Imagine the first time that this procedure is called with a length
$$K$$ context. In this case there will be nothing in the
appropriate restaurant, so it will attempt to sample something from
the base measure which is simply a restaurant associate with the
length $$K-1$$ context. It will fail to find anything in this
restaurant since this is the first sample, so it will backoff
again. Eventually, it will reach the empty context and sample a symbol
from the dictionary. This will cause the recursion to return,
populating each of the longer contexts with a table with that symbol.

When the base measure for one Dirichlet process is another Dirichlet
process the resulting distribution is called a '*Hierarchical
Dirichlet Process*.


# Lexical Memoization of Hierarchical Structure

> M. Johnson, T. L. Griffiths, and S. Goldwater (2007). Adaptor
> grammars: A framework for specifying compositional nonparametric
> Bayesian models. In Advances in Neural Information Processing
> Systems 19.

> Johnson, M. (2008). Using Adaptor Grammars to identify synergies in
> the unsupervised acquisition of linguistic structure. In Proceedings
> of the 46th Annual Meeting of the Association for Computational
> Linguistics, Columbus, OH.

The segmentation models above essentially assume two levels of
linguistic constituency: the morpheme and the utterance. Of course,
actual linguistic input is characterized by multiple levels of
linguistic structure: utterances consist of phrases, phrases consist
of words, words consist of morphemes, morphemes have syllable
structure, etc.

We can represent such nested hierarchical structures using a
probabilistic context-free grammar. Let's begin by just modeling
potential morphological structure internal to words.

~~~
;;;fold:
(define (flatten l)
  (if (null? l)
      '()
      (if (list? (first l))
          (append (flatten (first l)) (flatten (rest l)))
          (pair (first l) (flatten (rest l))))))
;;;fold:
(define phone-inventory '(a e i o u p t k b d g s ch f z gh v))

(define (consists-of constituent)
  (case constituent
    (('U) (multinomial(list (list 'W 'U)
                            (list 'W))
                      (list (/ 1 3) (/ 2 3))))
    (('W) (multinomial (list (list 'Pre 'Stem 'Sfx)
                             (list 'Pre 'Stem)
                             (list 'Stem 'Sfx)
                             (list 'Stem))
                       (list (/ 1 4) (/ 1 4) (/ 1 4) (/ 1 4))))
    (('Pre) (multinomial (list (list 'Phone 'Pre)
                               (list 'Phone))
                         (list (/ 1 2) (/ 1 2))))
    (('Stem) (multinomial (list (list 'Phone 'Stem)
                                (list 'Phone))
                          (list (/ 1 2) (/ 1 2))))
    (('Sfx) (multinomial (list (list 'Phone 'Sfx)
                               (list 'Phone))
                         (list (/ 1 2) (/ 1 2))))
    (else 'error)))

(define tree-unfold
  (lambda (symbol)
    (if (equal? symbol 'Phone)
        (uniform-draw phone-inventory)
        (pair symbol
              (map
               (lambda (symbol) (tree-unfold symbol))
               (consists-of symbol))))))

(tree-unfold 'U)

~~~

This context-free grammar correctly captures the fact that words can
consist of prefixes, stems, and suffixes. However, as defined it
includes no capacity for *reusing* morphemes across words. However,
this is easily fixed simply by defining the `tree-unfold` using `DPmem`.

~~~
;;;fold:
(define (flatten l)
  (if (null? l)
      '()
      (if (list? (first l))
          (append (flatten (first l)) (flatten (rest l)))
          (pair (first l) (flatten (rest l))))))
;;;fold:
(define phone-inventory '(a e i o u p t k b d g s ch f z gh v))

(define (consists-of constituent)
  (case constituent
    (('U) (multinomial(list (list 'W 'U)
                            (list 'W))
                      (list (/ 1 3) (/ 2 3))))
    (('W) (multinomial (list (list 'Pre 'Stem 'Sfx)
                             (list 'Pre 'Stem)
                             (list 'Stem 'Sfx)
                             (list 'Stem))
                       (list (/ 1 4) (/ 1 4) (/ 1 4) (/ 1 4))))
    (('Pre) (multinomial (list (list 'Phone 'Pre)
                               (list 'Phone))
                         (list (/ 1 2) (/ 1 2))))
    (('Stem) (multinomial (list (list 'Phone 'Stem)
                                (list 'Phone))
                          (list (/ 1 2) (/ 1 2))))
    (('Sfx) (multinomial (list (list 'Phone 'Sfx)
                               (list 'Phone))
                         (list (/ 1 2) (/ 1 2))))
    (else 'error)))

(define tree-unfold
  (DPmem 1.0
         (lambda (symbol)
           (if (equal? symbol 'Phone)
               (uniform-draw phone-inventory)
               (pair symbol
                     (map
                      (lambda (symbol) (tree-unfold symbol))
                      (consists-of symbol)))))))

(tree-unfold 'U)
~~~

The resulting model is known as the *adaptor grammars* framework.  All
 we have done is stochastically memoized the `unfold`
 procedure. However, despite the simplicity of the model, the effects
 are subtle and far-reaching. An important point is that the `unfold`
 procedure is recursive, which means that the base measure of the
 corresponding Dirichlet process is defined in terms of other
 Dirichlet processes. In general, this means that the entire
 distribution is described by a set of mutually recursive equations
 (note that in the general case, we have no guarantee that there
 exists a fixed-point for this set of equations and that generation
 will halt). In other words, when we decide to build a new structure
 for a particular category type, its substructures are themselves
 sampled from the adapted distributions: we are learning lexica of
 reusable utterances, words, prefixes, stems, and suffixes.

Note that adaptor grammars always store every generated structure in
its entirety: from root to leaves. Thus, after the first time a
structure is generated, it will become a single, reusable lexical
unit, regardless of its (implicit) internal structure. In classical
generative grammar, rules that fire once but then store their outputs
were known as *lexical redundancy rules* and were often used to
express unproductive generalizations amongst sets of lexical
items. Thus, adaptor grammars can be interpreted as a modern,
probabilistic update of such classical lexical redundancy rules. 

## Learning the Pattern of Computation and Reuse

> O’Donnell, T. J. (2015). Productivity and Reuse in Language: A
> Theory of Linguistic Computation and Storage. The MIT Press,
> Cambridge, Massachusetts.

> T. J. O’Donnell, N. D. Goodman, and J. B. Tenenbaum (2009). Fragment
> grammars: Exploring computation and reuse in language. Technical
> Report MIT-CSAIL-TR-2009-013, Massachusetts Institute of
> Technology—Computer Science and Artiﬁcial Intelligence Laboratory.


Adaptor grammars is a framework for learning reusable lexical units
including stored units with internal structure. However, perhaps the
most striking feature of natural language is the existence of
*productive* units: that is, units such as the suffix *-ness* which
freely combine with other units and are not retrieved from memory as
part of larger words or other constructions. A natural question that
arises is whether we can capture the distinction between productive
and unproductive units using a similar framework based on lexical
memoization.

From the point of view of the learner, the question can be posed as
follows: given some particular input such as the word *happiness* did
the speaker produce the whole word via a single memory retrieval
operation or did they compute the form via productive composition. We
can build a model which captures this distinction by introducing
another layer of latent structure corresponding to the answer to this question. 


~~~
;;;fold:
(define (flatten l)
  (if (null? l)
      '()
      (if (list? (first l))
          (append (flatten (first l)) (flatten (rest l)))
          (pair (first l) (flatten (rest l))))))
;;;fold:
		  
(define phone-inventory '(a e i o u p t k b d g s ch f z gh v))

(define (consists-of constituent)
  (case constituent
    (('U) (multinomial(list (list 'W 'U)
                            (list 'W))
                      (list (/ 1 3) (/ 2 3))))
    (('W) (multinomial (list (list 'Pre 'Stem 'Sfx)
                             (list 'Pre 'Stem)
                             (list 'Stem 'Sfx)
                             (list 'Stem))
                       (list (/ 1 4) (/ 1 4) (/ 1 4) (/ 1 4))))
    (('Pre) (multinomial (list (list 'Phone 'Pre)
                               (list 'Phone))
                         (list (/ 1 2) (/ 1 2))))
    (('Stem) (multinomial (list (list 'Phone 'Stem)
                                (list 'Phone))
                          (list (/ 1 2) (/ 1 2))))
    (('Sfx) (multinomial (list (list 'Phone 'Sfx)
                               (list 'Phone))
                         (list (/ 1 2) (/ 1 2))))
    (else 'error)))


(define compute-or-reuse
  (lambda (symbol)
    (if (flip)
        (delay (tree-unfold symbol))
        (tree-unfold symbol))))

(define tree-unfold
  (DPmem 1.0
         (lambda (symbol)
           (if (equal? symbol 'Phone)
               (uniform-draw phone-inventory)
               (map compute-or-reuse (consists-of symbol))))))

(tree-unfold 'U)				   
~~~
