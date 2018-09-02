---
title: Formal Languages
---

# The Problem: Beginnings

The goal of modern generative linguistics is to achieve a precise computational understanding of how language works. How do speakers turn the meanings they wish to communicate into utterances that can be spoken, written, or signed and how do listeners map these incoming signals to the meanings that they understand? Clearly, this is a big question whose answer will involve many components from understand the basic perceptual systems of the human mind to understanding what meaning is in the first place. Like all complex scientific problems, we need to make some simplifying assumptions in order to make progress. 

Let's start by making a few remarks about the part of the problem we will deal with in this course. Our first simplifying assumption is that we will focus on just the problem of explaining the structure of sentences. Consider the following English sentence.

> John loves Mary.

What can we say about a sentence like this? First, it is obviously built from a set of basic units like *words* and *morphemes*. Second, sentences are *compositional*: the meaning of the whole sentence is the result of the meaning of the individual words used in the sentence as well as the way they are combined. For example,

> Mary loves John.

means something quite different from the first sentence. As English speakers, we know something which tells us that the ordering of the words affects their combined meaning in systematic and predictable ways. Furthermore, many combinations of words are not valid in English.

> $$^*$$loves Mary John.

Note here we are using the English convention of using the symbol $$^*$$ at the beginning of a sequence that is not a possible English sentence or in technical terms is *ungrammatical*. While we may be able to guess what the speaker intended (or maybe not) if we heard this sequence of words, we know that it isn't valid English. Chomsky gave the following famous pair of examples which illustrates this point more forcefully. 

> Colorless green ideas sleep furiously.  
> $$^*$$Furiously green sleep ideas colorless. 

In the preceding examples, the first sentence is well-formed in English, while the second is not. What is striking is that the well-formedness of the first sentence doesn't seem to mean anything that makes any sense. Chomsky used this example to illustrate the point that whatever principles tell us what a possible English sentence is, they must be at least partially independent of whether or not the sequence has a meaning. Another famous example comes from Lewis Carrol's poem *Jabberwocky* which begins. 

> Twas bryllyg, and the slythy toves  
> Did gyre and gymble in the wabe:  
> All mimsy were the borogoves;  
> And the mome raths outgrabe.

These examples seem to suggest that we might make a start of our study of sentence structure by asking which sequences of words are possible, *grammatical* English sentences and which are not. This question of *grammaticality* is one of the central problems of natural language *syntax*&mdash;the scientific study of the grammar of sentences.

Before moving on, it is worth making a few comments on the study of grammatical and ungrammatical word sequences since it often leads to confusion. Our focus on th problem of grammatical and ungrammatical sequences is an idealization. The examples above suggest that we may be able say something useful about sentence structure without considering meaning. This isn't to suggest that meaning is not important: Everyone agrees that the ultimate problem we wish to solve is to understand how to map from form to meaning and back again. Considerations of meaning are central to the study of syntax, and we will bring them into play very shortly in this course. We start, however, with this simplified problem in the hope that it will teach us some lessons which will continue to be important as we develop more sophisticated models and consider more sophisticated kinds of data.


# Lexica and Strings

To begin our idealization, let's assume (incorrectly) that we have a fixed set of words in our language. We will write this set of words $$V$$ which stands for the set of words in our language or the *vocabulary*, sometimes this is called the *lexicon*&mdash;the technical term linguists use for the inventory of words (or morphemes) in a language. In formal language theory, this is primitive set of symbols is often also called the *alphabet* and is typically written $$\Sigma$$. But, since we are focused on sentence structure in this course we will use the term *vocabulary* and the symbol $$V$$ for this 
set. As an example, we might have a small vocabulary only consisting of the three words *John*, *loves* and *mary*, that is, $$V = \{John, loves, Mary\}$$. From a formal perspective, we don't usually care much about the actual members of $$V$$. In  formal examples we will often use simply symbols like $$a$$,$$b$$ instead of real words. We will insist for now, however, that the vocabulary is *finite*. 

<!-- todo: what is the best notation and terminology to use for \Sigma and strings and whatnot -->

To begin studying possible and impossible sentences, we will need some notion of a sequence of words. In formal language theory, this is called a *string* and is any *finite* sequence of symbols in $$V$$. For simplicity, let $$V = \{a,b\}$$. Note that we will use square brackets to indicate strings. Some strings *over* this lexicon (or alphabet) are $$[a]$$, $$[aaaab]$$, $$[ababababa]$$, etc. One reason we use brackets to indicate strings is so as not to confuse a string $$[a]$$ with a single symbol from the symbol itself $$a$$. We will sometimes use variable $$x, y, z, ...$$ to refer to strings over the vocabulary $$V$$. 

The *length* of a string $$\mid x \mid$$ is the number of symbols in the string. For example, $$\mid [aba] \mid=3$$.

There is a special, unique string called the *null string* that has length $$0$$ and is written $$[]$$, i.e., $$\mid [] \mid=0$$. In traditional notation, the null string is usually written $$\epsilon$$, but our notation makes its properties clearer. This string always exists over any lexicon. 

<!-- todo: write the length function recursively -->

Let $$[V]$$ be the set of shortest strings that includes the vocabulary and the null string. In other words if $$V=\{a,b\}$$ then $$[V]=\{[],[a],[b]\}$$. Essentially, putting brackets around the vocabulary just "wraps" each elementary symbols into a string and adds the empty string.
The set of all possible strings over a vocabulary $$V$$ is written $$[V]^*$$, a symbol called the *Kleene star*. Thus, $$[V]^*=[\{a\}]^*=\{[],[a],[aa],[aaa],[aaaa],...\}$$ and $$[V]^*=[\{a,b\}]^*=\{[],[a],[b],[ab],[ba],[aaa],[bbb],[aba],[bba],[abb],...\}$$. If we are using real words or other symbols of length longer than $$1$$, we will put spaces in to indicate the elements of the string, e.g., $$[John\ loves\ Mary]$$.

<!-- todo: what is the cardinality of W^* -->

When talking about sets of strings, we will take the empty set $$\emptyset$$ to contain the null string, that is, $$\emptyset=\{[]\}$$.

The basic operation that we can perform on strings is *concatenation*. If we have two string variables $$x$$ and $$y$$ we write the concatenation like $$x \cdot y$$, or sometimes just $$xy$$. If we are talking some actual strings $$[ab]$$ and $$[ba]$$ we will write $$[ab]\cdot[ba]=[abba]$$.

Concatenation is associative, which means it doesn't matter what order you do it in, i.e., $$(xy)z=x(yz)$$, and the null string is an *identity* for the operation which means concatenating the empty string on anything gives you back the same string:  $$x \cdot []=[] \cdot x=x$$. The length of a concatenated pair of string is the sum of the lengths of each $$\mid xy \mid= \mid x \mid + \mid y \mid$$.

We write $$x^n$$ for $$n$$ concatenations of the string $$x$$. So if $$x=[ab]$$, $$x^3=[ababab]$$, $$x^1=[ab]$$, and $$x^0=[]$$.

A *prefix* of a string $$x$$ is an initial substring of $$x$$. For instance, the string $$[ab]$$ is a prefix of the string $$[abababab]$$. Note that we consider the empty string a prefix of every other string and every string is a prefix of itself.


## Representing Formal Strings

We have now defined a simple idealization of a sentence as a *string* of words (or symbols). How can we represent this in LISP? In this course, we will use *symbols* to represent the atomic symbols in $$V$$. As our notation has hopefully made clear, a natural representation for formal strings is the *list* datatype. 

```
(def my-string '(a b a b))
my-string
```

## Concatenation

We have already seen how we can build up lists by using "cons" together with the null string "'()". When using "cons" to build a string of symbols, we pass in two arguments: a symbol and another string.

```
(cons 'a my-string)
```

Can we use "cons" to define concatenation? What happens if we "cons" two strings together?

```
(cons '(a b) '(a b))
```

We have ended up with a pair consisting of two string, rather than a single string with the elements of both. This is not the desired behavior as an implementation of concatenate. Clojure has a primitive operation which takes two strings and produces the result of putting them together to make a single string called "concat" which will use as our implementation of concatenate.

```
(concat '(a b) '(a b))
```

We can also define a predicate "prefix?" which tests whether on string is a prefix of another.

```
(defn prefix? [pr str]
  (if (> (count pr) (count str))
      false
      (if (empty? pr)
          true
          (if (= (first pr) (first str))
              (prefix? (rest pr) (rest str))
              false))))

(prefix? '(a b c) '(a b))
```

# Formal Languages

So far we have defined the formal notion of a string as a model of word sequences in natural language. Our initial goal was however to be able to distinguish between grammatical strings like *colorless green ideas sleep furiously* and $$^*$$*furiously green sleep ideas colorless*. How can we capture this distinction?

One simple way to distinguish between well-formed strings and ill-formed strings is simply to define the well-formed strings as constituting a set, called a *formal language*, $$L$$. Recall that $$[V]^*$$ is the set of all possible strings over some vocabulary $$V$$. Thus a formal language is simply any subset of $$[V]^*$$. For any pair of formal languages, $$L$$ and $$L^\prime$$ we define the following usual set-theoretic definitions. 

$$x \in L$$ means that the string $$x$$ is an *element of* the language $$L$$.

$$L \cup L'$$ is the *union* of the two formal languages, that is, the set of all strings in one language or the other or both. It can be computed by adding the two sets together and removing copies. 

$$L \cap L'$$ is the *intersection* of the two formal languages, that is, the set of all strings in both languages. It can be computed by taking each string in $$L$$, checking if it is also in $$L^\prime$$, and keeping it if it is, otherwise throwing it away.

$$\sim L$$ is the *complement in $$[V]^*$$* of $$L$$, that is, it is the set of all possible strings over our lexicon $$W$$ that **are not** in $$L$$. Since there are an infinite number of strings in $$W^*$$, this set may not be easy to compute. 

A perhaps more unusual definition is the *concatenation* of two formal languages: $$L \cdot L'$$. We have already seen what it means to concatenate two strings $$x$$ and $$y$$ to form $$xy$$. What does it mean to concatenate to **sets** of strings? The concatenation of two formal languages is defined by taking every string in the first language and concatenating it to every string in the second language, that is, it is the set $$\{xy \mid x \in L \wedge y \in L' \}$$. Note that if there are $$5$$ strings in $$L$$ and $$10$$ strings in $$L'$$ there will be $$50$$ strings in $$L \cdot L'$$ since we concatenate every string in $$L'$$ to every string in $$L$$.

We write $$L^n$$ for $$n$$ concatenations of the language $$L$$ to itself and $$L^*$$ for the set of strings that results from concatenating $$L$$ to itself $$n$$ times for all $$n$$. If we consider the set $$V$$ to consist of all the length one strings in our lexicon, e.g.,  $$\{[a], [b]\}$$, then we see why $$[V]^*$$ is the set of possible strings over our vocabulary.

## Some Examples of Formal Language

Some important formal languages we will encounter in this course include the following. The set of all alternating $$a$$s and $$b$$s, $$[ab]^n$$. The set of all string with $$n$$ $$a$$'s followed by $$n$$ $$b$$s, i.e., $$a^n b^n$$, which we will call the *counting language*. The set of all strings over a vocabulary $$V$$ plus one copy of themselves, i.e., $$xx$$, which we will call the *copy language* and the set of all strings over $$V$$ plus their reversal $$xx^R$$ where $$x^R$$ means the reversal of $$x$$. We will see that many of these formal languages have special properties related to natural language.

## A First Model of Well-Formed and Ill-formed Sentences

We have now defined the notion of a formal language. How can we use it to characterize the idea of well-formed and ill-formed sentences? One easy way is to say that all the well formed sentences are within some formal language $$L$$ and all other possible strings $$\sim L$$ are ill-formed. 

This is a good start, but how do we say which sentences are within $$L$$. As a first idea, if the set $$L$$ is finite, we can just list it. For example, if our lexicon is $$W = \{a,b\}$$, we could define $$L=\{[a],[aba],[bbb],[ab]\}$$. How will this work out as a model of well-formed sentences?

Let us consider a very restricted subset of the English language. We will start with a single sentence:
>Alice talked to the father of Bob.


This is clearly a grammatical sentence in the English language, and we can use it as the basis for a sequence of longer and longer sentences:

>Alice talked to the father of the mother of Bob.

>Alice talked to the father of the mother of the father of Bob.

>Alice talked to the father of the father of the mother of Bob.

>Alice talked to the father of the mother of the father of the mother of Bob.

>Alice talked to the father of the father of the mother of the mother of Bob.


These sentences were constructed by adding the prepositional phrases *of the mother* and *of the father* to the base sentence. It is clear that each of these new sentences is grammatical, and there is no reason to stop after only four iterations of this process: In principle we can insert these prepositional phrases as many times as we want, and the resulting sentence will be grammatical. 

In order to characterize this subset of English, we can try to simplify the strings we are talking about. Let's define a function from strings of English words to strings over the vocabulary 
$$\{[],[a],[b]\}^*$$ (i.e., $$E^* \mapsto \{[],[a],[b] \}^* $$) called a *systematic relabelling* or *homomorphism*. <!--- $$h$$ with the property that $$h(x \cdot y)= h(x)\cdot h(y)$$. This property just says that we can take two strings, concatenate them and push them through this function or we can push the two things through the function and then concatenate them in the new set, and either way we get the same answer. It encodes the idea of *preserving* the structure of concatenation in the source set. -->

It is not hard to show (though we won't) that any functions from English strings to $$\{[],[a],[b]\}^*$$ that has this property can be defined by saying which string in $$\{[],[a],[b]\}^*$$ each word of English $$E$$ maps to, that is, we can define this function by giving a mapping for each length one string and the null string in the vocabulary of English.

Let's define $$h$$.  Every time that we see the word *father*, we will replace it with the character $$a$$, and every time we see the word *mother*, we will replace it with the character $$b$$. Every other word, we will ignore (i.e., we will delete it). 

$$\begin{eqnarray}
h([]) & = & []\\
h([father]) & = &[a]\\
h([mother]) & = & [b]\\
h(x) & = & []\ \forall\ [x] \notin \{[],[father],[mother]\}
\end{eqnarray}$$

The first sentence, containing only one instance of *father*, will then be transformed to the string $$a$$. The second sentence, containing *father* and then *mother*, will be transformed to $$ab$$. Continuing in this manner, we see that this fragment of English will get mapped to the language $$L = \{[],[a],[b],[ab],[ba],[aaa],[bbb],[baa],[aba],[baa],[aab],[abab],...\}$$. This language $$L$$ captures the  structure of these particular prepositional phrases. Notice that other sentences using the relevant words, like *the mother saw the father*, are also correctly mapped into strings in this language, even when they aren't used in prepositional phrases. Thus our homorphism is defined correctly for every sentence of English. It also clearly demonstrates that our fragment of English is potentially **infinite**&mdash;no finite list will contain all of its grammatical sentences.

We must conclude that a formal language model of at least some natural languages, notably English, must be infinite. In formal language theory we often work with infinite languages like this. It is worth noting a few things. First, we are not arguing that every natural language must be infinite; we may find one that is finite. This is an empirical question. Second, our use of infinite languages is an idealization. Of course, no amount of English that we sample in the wild will be infinite, we will always observe just a finite subset of the language. The point is that there is particular bound on the length of sentences $$n$$ which makes sense to specify *a priori*. The infinite language captures our intuition that the process of sentence formation in English is *unbounded* the number of times you are allowed to do something is not specified in advance, not that there exists an actual infinite set of English sentences somewhere in the universe.

<!-- TODO: we probably do want to do an alternating example, this one was not, but I think we want one to motivate the discussion below. -->

<!-- ## A Second Example

Consider the following sentences. 

>Alice talked to John's father.

>Alice talked to the father of the mother of the father of Bob.

>Alice talked to the father of the father of the mother of Bob.

>Alice talked to the father of the mother of the father of the mother of Bob.

>Alice talked to the father of the father of the mother of the mother of Bob. -->

# Computational Models of Infinite Formal Languages

We saw in the preceding section that we cannot use finite formal languages as models of natural language sentences. At the very least, we will need  infinite formal languages to model some natural languages like English. But how do we define an infinite language?  

It is here that our notion of a model of computation become indispensable. While we cannot directly list the elements of an infinite formal language, we can write a computer program that *characterizes* the set in some way. 

Take the example of the formal language $$L=\{[ab]\}^*$$, that is, the set of all strings which consist of sequences of $$[ab]$$, e.g., $$\{[ab], [abab], [abab], [ababab], ...\}$$. How could we characterize this set with a computer program? In general, there are two main approaches. 

## Language Recognizers

First we could write a computer program which tells us whether or not a given string was in this language. This approach is called *language recognition*. How do we write a recognizer for the language $$L=\{[ab]\}^*$$?

```
(defn lang-ab*? [str]
    (if (empty? str) 
        true
        (if (prefix? '(a b) str)
            (lang-ab*? (rest (rest str)))
            false)))
```

There is a lot going on in this example, so let's break it down. The function is recursive. The most basic case is if the string is empty, that is if the formal string is equal to $$[]$$.

```
(lang-ab*? '())
```

Next consider the case where the string isn't empty. Now, we need to check if the beginning of the string is equal to $$[ab]$$. If it isn't, then the result is simply false.

```
(lang-ab*? '(b b a b))
```

## Language Generators

Another way to specify a formal language using a computer program is by *generation*&mdash;providing a program which constructs or generates the 
elements of the set. 

Consider again our formal language $$\{[ab]\}^*$$, how can we construct the strings in this set? If we knew the number of copies $$n$$ of the string $$[ab]$$ in advance, we could easily write a procedure that generated the target string.  

```
(defn generate-abn [n]
  (if (= n 0)
      '()
      (concat '(a b) (generate-abn (- n 1)))))
(generate-abn 10)
```

Of course, this procedure doesn't generate the **whole** set $$\{[ab]\}^*$$. However, in a certain sense it does precisely characterize the entire set. In particular, this function provides a mapping from an infinite set which we understand well, the natural (or counting) numbers to the set of strings in $$\{[ab]\}^*$$. For each natural number $$n$$, it returns a single element of $$\{[ab]\}^*$$.

There are at least two ways in which we can use such a mapping.

First, since we know how to count from $$0$$ to any natural number, no matter how high, we could use this procedure to generate any element of the set if we are willing to wait long enough. This perspective on characterizing the infinite set is known as *enumeration*. 

Second, we are free to imagine that there is another, unknown, process which somehow chooses the natural number $$n$$. This choice process can work in any way, and does not need to be known to us. The important thing is that however we choose $$n$$ we get a member of the set $$\{[ab]\}^*$$, and we can choose whatever $$n$$ we like. This perspective is called *nondeterministic choice*. 

In some sense, the nondetermistic choice perspective is a more fundamental characterization of the set. When we think about the language $$\{[ab]\}^*$$, the order in which we list the elements doesn't matter. But to enumerate the set, we have to pick some particular ordering of $$n$$ (for instance counting from $$0$$ up). The nondeterministic choice perspective emphasizes that we don't really care how you pick this order; we just care which ones are in the set and which ones are not.

Recognizers and generators are both ways of characterizing sets *intensionally* rather than *extensionally*, that is, by listing. They  differ in one important way. While recognizers give you a *yes* or *no* answer (when the language is *decidable* in any case), generators only give you a characterization for the strings that are actually **in** the language. 

# Generative Models of Language

Modern linguistics is often called *generative linguistics*. This name stems from the use of generators as models of linguistic structure. As we will see, the field actually uses both the generator and recognizer perspectives to define models of language. This dual perspective also corresponds to the dual problem of explaining both language production (generation) and comprehension (recognition).  The important thing is that we will try to define finite programs that **characterize** the set of possible English sentences. In the next lecture we will start building such models of natural language sentence structure. 
