---
layout: hidden
title: 8 Hidden Markov Models
---


# Latent Structure

Ngram models were fundamentally unable to capture certain kinds of linguistic structure. In particular, they are only able to capture *bounded* dependencies -- dependencies between words within a certain, fixed distance of each other. As we have seen, however, natural languages contain *unbounded* dependencies. The grammatical form of one portion of the sentence may be determined by another part of the setnence which is arbitrarily far away. 

In order to capture unbounded dependencies, and other aspects of linguistic structure, we will introduce *latent* (i.e. not directly observed) structure into our models. In fact, we have already seen a simple example of latent structure, the variable $$\theta$$ in our definitions of the Dirichlet categorical distribution, and the individual $$\theta_{\mathbf{c}}$$'s that define the distributions over next symbols in our Dirichlet-categorical ngram model. In these models, the distribution over the vocabulary items in each case is unobserved and we used Bayesian updating, or the principle of maximum likelihood to compute an approximation to this distribution. However, in these cases the latent random variable was *global* in the sense that they were fixed for the whole model, they were also continuous parameters of other distributions.

# Adding Categories


When we discussed the limitation of the categorical BOW model, we discussed the dependency between words in the sentence 

> Colorless green ideas sleep furiously.  

and how these helped to distinguish this sentence from the sentence

> $$^*$$Furiously green sleep ideas colorless. 

For example, we noted that *green* is an adjective which *modifies* the nominal *head* *ideas*. Note that even this description makes use of a certain kind of **latent** structure&mdash;whether a word is an adjective, a noun or another *grammatical category*, *lexical category*, or *part-of-speech*. This kind of information is of course absolutely crucial in describing the structure of sentences&mdash;no serious model of grammatical structure fails to allow words to be grouped into categories to describe generalizations. So, as the next step in our process of building more accurate models of grammatical and ungrammatical sentences of a language, let's add word categories.

# Bags of Categories Models

Perhaps the simplest way to add category information is simply assume that the lexicon is divided into categories, each of which has their own distribution over words. In order to sample from such a model, we first sample a category for each word, and then sample a word from the distribution over words given that category. If $$\mathcal{S}$$ is a set of categories, and we further assume Dirichlet priors over all of the relevant distributions, our model becomes. 

$$\begin{align}
\vec{\theta}_{\mathcal{S}} &\sim& \mathrm{Dirichlet}(\vec{\alpha}_{\mathcal{S}})\\
\{\vec{\theta}_{c} \} &\sim& \mathrm{Dirichlet}(\vec{\alpha}_{c})\\
c^{(i)} &\sim& \mathrm{categorical}(\vec{\theta}_{\mathcal{S}})\\
w^{(i)} \mid c^{(i)} &\sim& \mathrm{categorical}(\vec{\theta}_{c^{(i)}})\\
\end{align}$$

Or in probability notation.

$$\Pr(W^{(1)},\dots,W^{(k)},C^{(1)},\cdots,C^{(k)})=\prod_{i=1}^k \Pr(W^{(i)} \mid C^{(i)}=c^{(i)}) \Pr(C^{(i)} \mid \vec{\theta}_{\mathcal{S}})$$


## Topic Models

One obvious problem with such a model is that we have now given up our ability to encode sequential dependencies between words in different positions (why is this?). Nevertheless, bag of categories models have an important application in applied machine learning and artificial intelligence in that they form the basis of *topic models*. 

# Adding Sequential Structure: Hidden Markov Models

As we just discussed, one major issue with the bag of categories model is that we have given up our ability to model sequential dependencies once again. How can we fix this? One way is to imagine that we have an ngram model over the categories in our distribution. Since another name for *ngram* models is *Markov models* this model is known as a *hidden Markov model* (HMM) because the Markov assumption is over the **latent** or *hidden* categories. HMMs are one of the most important models in all of science, have a very well-developed theory and are used in thousands of practical applications. 

$$\begin{align}
\vec{\theta}_{T,c} &\sim& \mathrm{Dirichlet}(\vec{\alpha}_{T})\\
\vec{\theta}_{O,c} &\sim& \mathrm{Dirichlet}(\vec{\alpha}_{O})\\
c^{(i)} \mid c^{(i-1)} &\sim& \mathrm{categorical}(\vec{\theta}_{T, c^{(i-1)}})\\
w^{(i)} \mid c^{(i)} &\sim& \mathrm{categorical}(\vec{\theta}_{O, c^{(i)}})\\
\end{align}$$

Or in probability notation.

$$\Pr(W^{(1)},\dots,W^{(k)},C^{(1)},\cdots,C^{(k)})=\prod_{i=1}^k \Pr(W^{(i)} \mid C^{(i)}=c^{(i)}) \Pr(C^{(i)} \mid C^{(i-1)}=c^{(i-1)})$$

Because they are so common and well-studied, HMMs come with their own special terminology. In HMMs, the set of categories are called *states*. The distribution between states is called the *transition distribution* and the distribution over words given a state is called an *observation distribution*. 


# Marginalizing Across Latent Variables

We would like to be able to compute the probability of just the words. This involves marginalizing over **all possible** sequences of hidden categories (states) that could have produced those words.

$$\Pr(W^{(i)},\dots,W^{(k)},C^{(k+1)}=\ltimes)=\sum_{c^{(1)}\in \mathcal{S}} \cdots \sum_{c^{(k)}\in \mathcal{S}} \Pr(W^{(1)},\dots,W^{(k)}, C^{(1)}=c^{(1)},\dots,C^{(k)}=c^{(k)},C^{(k+1)}=\ltimes)$$

$$\Pr(W^{(i)},\dots,W^{(k)},C^{(k+1)}=\ltimes)= \sum_{c^{(1)}\in \mathcal{S}} \cdots \sum_{c^{(k)}\in \mathcal{S}} \prod_i^k \Pr(W^{(i)} \mid C^{(i)}=c^{(i)}) \Pr(C^{(i)} \mid C^{(i-1)}=c^{(i-1)})$$

Let's look at a specific probability:

$$\begin{align}\alpha(w^{(1)},\cdots,w^{(k)},c^{(k)}) &=& &\Pr(W^{(i)}=w^{(1)},\dots,W^{(k)}=w^{(k)},C^{(k)}=c^{(k)})\\
\alpha(w^{(1)},\cdots,w^{(k)},c^{(k)}) &=& \Pr(W^{(k)}=w^{(k)}|C^{(k)}=c^{(k)}) & \sum_{c^{(k-1)}\in \mathcal{S}} \Pr(W^{(i)}=w^{(1)},\dots,W^{(k-1)}=w^{(k-1)},C^{(k-1)}=c^{(k-1)}) \Pr(C^{(k)}=c^{(k)}|C^{(k-1)}=c^{(k-1)})\\
\alpha(w^{(1)},\cdots,w^{(k)},c^{(k)}) &=& \Pr(W^{(k)}=w^{(k)}|C^{(k)}=c^{(k)}) &\sum_{c^{(k-1)}\in \mathcal{S}} \alpha(w^{(1)},\cdots,w^{(k-1)},c^{(k-1)})\Pr(C^{(k)}=c^{(k)}|C^{(k-1)}=c^{(k-1)})
\end{align}$$
