---
title: Random Variables
---

# Probability Distributions

We have now seen our first  probability distribution, the distribution over the set $$[ab]^n$$. We have in fact seen two different ways of defining this probability distribution, or *representations* of this distribution, in terms of a sampler and a scorer. In general, there are many different ways of representing a probability distribution. In this part of the course, we will focus on *discrete distributions*, that is, probability distributions whose support consists of discrete elements like integers or symbols. In this setting, the score function is also called a *probability mass function*. We can think of a probability distribution as a set, called the *support*, *sample space*, or *set of outcomes* $$S$$ together with a *probability mass function* $$p$$ which assigns a probability to each element of the support such that all $$p(s) \in [0,1]$$ and $$\sum_{s \in S} p(s) = 1$$. Note that these definitions will not be sufficient if our support is continuous (uncountable), and in that case we will need to make use of measure theory to give a well-defined notion of probability distribution. However, we won't consider these complications in this course. 

# The Bernoulli Distribution

One of the most basic probability distributions is the *Bernoulli distribution* which can be thought of as representing a distribution over a biased coin and is represented by "(flip weight)" where "weight" is the probabilities of heads (or "true"). It is useful to introduce some additional terminology and notation at this point. First, a *random variable* is a mathematical object that takes on a value from some sample space $$S$$ according to some probability mass function $$p$$. For instance, some particular invocation of "flip" constitutes a random variable. 

```
(defn flip [weight]
  (if (< (rand 1) weight)
      true
      false))
(def my-random-variable (flip 0.05))
my-random-variable
```

Importantly, notice two things about the definition of a random variable. First, the random variable is the **particular** call to "flip". While the procedure "flip" defines a distribution, the invocation of this procedure in "(def my-random-variable (flip 0.5))" defines a particular random variable. Second, the random variable refers to the **set** of values that "my-random-variable" can take on, not the particular value of the random variable in any one instance of a program run, which we will call the *value* of the random variable. Random variables can also be more complex objects built from simpler parts. 

```
(def my-random-variable (list (flip 0.5) (flip 0.5)))
my-random-variable
```

Here the random variable of interest is a **list** created by putting together two invocations of "flip". Each particular invocation of "flip" is also a random variable, as well. In general, we will think of any expression built up of samplers and deterministic (non-random) functions as a random variable with the *value* computed by evaluating that expression. Most of the kinds of objects we will be interested in in the course will be complex random variables built up of simpler ones like this.  

Since probability is a tool used across mathematics, engineering, and the sciences, there is a confusing array of different notation and conventions used in different contexts. Here we introduce some of them.

When $$X$$ is a random variable distributed according to some known distribution, such as Bernoulli, we often write the following. 

$$X \sim \mathrm{Bernoulli}(\theta)$$

This is read $$x$$ *is distributed as* a Bernoulli distribution with *parameter* (i.e., weight) $$\theta$$. Another standard notation is to use $$P(X=x)$$ to refer to the probability that random variable $$X$$ takes on value $$x$$. 

$$P(X=\mathrm{\#t}) = \theta$$

Crucially, $$P$$ here should be thought of as a higher-order function which takes a predicate $$X=\mathrm{\#t}$$ and returns the probability that that predicate is true. Often lower case $$p$$ and $$q$$ are used to refer to the probability mass functions associated with random variables, i.e., 

$$P(X=\mathrm{\#t}) = p(\mathrm{\#t}) = \theta$$

Often, people write $$P(X) = \{p(x) \mid x \in X\}$$ to refer to the whole distribution over the random variable $$X$$. 


# The Categorical Distribution

A *categorical distribution* is the name for a probability distribution over $$k$$ discrete outcomes. It is essentially a $$k$$-sided, biased die. It takes as a parameter a *probability vector* $$\theta$$, of length $$k$$ specifying the probabilities of the $$k$$ possible outcomes. A probability vector is simply a vector whose elements are probabilities $$\in [0,1]$$ which sums to one. 

If $$x$$ is a random variable drawn from a categorical distribution with parameters $$\theta$$, we write. 

$$X \sim \mathrm{categorical}(\theta)$$

## Sampling from a Categorical Distribution
How can we write a sampler for categorical distributions in our language?

```
(defn normalize [params]
  (let [sum (apply + params)]
    (map (fn [x] (/ x sum)) params)))
(normalize (list 2 1 1))

(defn sample-categorical [outcomes params]
  (if (flip (first params))
      (first outcomes)
      (sample-categorical (rest outcomes) 
                          (normalize (rest params)))))

(sample-categorical '(call me Ishmael) (list .5 .25 .25))
```

There are a few new things we have introduced here. First, we have defined a function calles "normalize" which takes a list of numbers and *normalizes* them, i.e. makes it so that they add to $$1$$. This function uses two new programming ideas.

The first is the "let" statement. The "let" statement gives us a local variable binding and used like this:

"(let [var1 expression1
      var2 expression2
      ...]
  body)"
  
Here "var1" etc. are variables whose values are bound to the values of the correspoding expressions. These variables can then be used in the body of the let statement, whose overall value is the result of evaluating the body. 

The second is the function "apply" which takes a function and a **list** of parameters to that function and applies the function to the list. Why do we use "(apply + params)" in the code above? This is because normally we would call the "+" function with a combination like "(+ 1 2 3)", but here we have access to a **list** called "params" containing the arguments. 

The function "sample-categorical" flips a coin to see if it should return the first object, if the coin comes up true it returns that object. Otherwise, it recurses on the rest of the objects and a **normalized** version of the remaining probabilities. One way to understand this is to realize that the categorical sampler always needs a properly normalized  distribution. But why is the right way to define this? We will see below.
  
## Scoring a Categorical Distribution

Now we have seen how to sample from a categorical distribution, how can we score a sample from a categorical distribution? In some sense, scoring a categorical distribution is trivial, since if we see an observation which is an instance of outcome $$i$$ in the support of the categorical, it's probability is just $$\theta_i$$, i.e., the probability of outcome $$i$$ in the parameter vector of the distribution. 

```
(def vocabulary '(call me Ishmael))
(def probabilities (list (/ 1 3) (/ 1 3 ) (/ 1 3 )))
(defn score-categorical [outcome outcomes params]
  (if (empty? params)
      (error "no matching outcome")
      (if (= outcome (first outcomes))
          (first params)
          (score-categorical outcome (rest outcomes) (rest params)))))

(score-categorical 'me vocabulary probabilities)
```

# Log Probabilities and Surprisal


When working with probability distributions in practice, we often need to compute large products of probabilities. Since probabilities are numbers between $$0$$ and $$1$$, often very small numbers, we can quickly get *underflow errors*. As numbers get very close to zero, they can drop below the level of precision provides by standard floating point representations.  
For this reason, we typically work with *log probabilities*.  


Log probabilities are simply the logarithms of probabilities. In this course, we will typically usually use the logarithm with base $$2$$ for log probabilities. Recall that the logarithm $$\log_2(x)$$ is the number of times that you would need to multiply $$2$$ by itself to get $$x$$. Since probabilities are numbers between $$0$$ and $$1$$ then the logarithm of a probability is necessarily negative since we are asking how many times we need to multiply $$\frac{1}{2}$$ by itself to reach $$x$$. Thus, log probabilities are numbers between $$-\infty$$, i.e., $$\mathrm{log}(0)$$ and $$0$$, i.e.,  $$\mathrm{log}(1)$$. 


Logarithms are useful because they give us a new way of representing numbers: in terms of exponentiation of a base. Instead of thinking about a number as the number of times you need to add $$1$$ to itself to get there, you can think about it as the number of times you have to multiple $$2$$ by itself to get there. In the log domain, addition corresponds to multiplication of the exponentiated logarithms. That is:

$$\log(p_1 \times p_2 \times p_3) = \log(p_1) + \log(p_2) + \log(p_3)$$

Since we are often computing products in probability theory, it is often useful to work in the log domain and, instead compute sums. 

Since the logarithms of very small probabilities (i.e., probabilities close to $$0$$) are negative numbers with very large absolute values, they can avoid underflow errors.

There is one disadvantage, however, which is that to add log probabilities, we have no choice but to exponentiate. We usually define a function called "logsumexp" to do this. 

```
(defn logsumexp [& log-vals]
   (Math/log2 (apply + (map (fn [z] (Math/pow 2 z)) log-vals))))

(logsumexp (Math/log2 0.5) (Math/log2 0.5))
 ```
 
In this example, we have used a new Clojure notation, the "&" in the function definition. This notation tells scheme that it should take all of the arguments passed into a call like "(logsumexp -10 -12 -1)" and make them into a single list and bind this list to the variable called  "log-vals". "logsumexp" first exponentiates all of its arguments, turning them back into ordinary probabilities, then adds them, and returns the logarithm of the result. Of course, if any of our log probabilities were very large in absolute value, we might still get underflow errors. One way of dealing with this is as follows. 

```
(defn logsumexp [& log-vals]
  (let [mx (apply max log-vals)]
    (+ mx
       (Math/log2
           (apply +
                  (map (fn [z] (Math/pow 2 z))
                       (map (fn [x] (- x mx)) log-vals)))))))

(logsumexp -1 -1)
```

In information theory, an important quantity is the *surprisal* or *self-information* associated with an event. Intuitively, the more improbable an event is, the more surprising it is to learn that it has occurred. Surprisal is defined, therefore, as. 

$$\mathrm{surprisal}(p) =  -\log(p)$$


When the logarithm used is base $$2$$ then the quantity is measured in *bits* of information. 

Another, equivalent way to define surprisal is as follows. 

$$\mathrm{surprisal}(p) =  \log(\frac{1}{p}) =  -\log(p)$$

Since probabilities are numbers between $$0$$ and $$1$$ we can think of them as fractions $$p=\frac{1}{N_p}$$ which are interpreted as the number of times $$N_p$$ you would need to see some event happen before you would expect to see the outcome exactly once. So $$\frac{1}{p}=N_p$$. In other words, surprisal is the number of times you would need to see something happen before the event happened once, on a log scale. 

# Entropy

The *expectation* of a function $$f$$ with respect to a random variable $$X$$ is just the **average** of the function with respect to the random variable.

$$\mathbb{E}_{x \sim X}[f(x)]= \sum_{x \in X} p(x)\cdot f(x)$$

The *expectation of a random variable* itself is just the value of the expectation with respect to the identity function $$f(x)=x$$.

One might ask, how surprising on average, is a random variable? We can answer this question by letting $$f=\mathrm{surprisal}$$
 
$$\mathbb{E}_{x \sim X}[\mathrm{surprisal}(x)]= \sum_{x \in X} p(x) \cdot \log(\frac{1}{p(x)}) =  -\sum_{x \in X} p(x)\log({p(x)}) $$

This quantity, the **average surprisal** is known as *entropy* of a random variable, and is a quantity of fundamental importance across probability and information theory.
