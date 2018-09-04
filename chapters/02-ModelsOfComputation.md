---
layout: chapter
title: 2 Models of Computation
---

How does language work? This is the foundational question which motivates the field of linguistics. The modern study of language or *generative linguistics* began in the late 1940s and early 1950s when it was realized that the emerging understanding of computation that resulted from the work of Kurt Gödel, Alan Turing, Alonzo Church, Emil Post, Rózsa Péter, Stephen Kleene and others might be able to shed light on this question. 

These researchers had begun to explore simple *machine models* of computation such as the Turing machine, Post rewrite systems, the $$\mu$$-recursive functions, and the $$\lambda$$-calculus. These models were originally intended to formalize the notion of *mathematical computation* or the reasoning processes used by a mathematician in proving theorems in a step-by-step fashion. Two surprising facts were soon discovered. First, Turing machines, $$\lambda$$-calculus, and other systems so-introduced proved to be equivalent in the sense that they could be used to define exactly the same set of functions. It was conjectured that this set of formalisms, the *Turing-complete* formalisms,  in fact defined the maximal set of function that could be *effectively computed*&mdash;that is, actually implemented in real physical hardware (this conjecture is known as the *Church-Turing thesis*).  Second, it was discovered that there existed particular machines in each formalism which were *universal computers*. These machines could be programmed using their input to simulate the behavior of any other machine in the class. In modern terms, these machines are interpreters able to perform any computation definable by a Turing machine.

These discoveries, which occurred in the 1930s launched the modern theory of computation. It wasn't long before researchers began to realize that such models might have applications in modeling more general processes of the human mind beyond theorem proving. In particular, beginning in the early 1950s researchers such as Yoshua Bar Hillel, Charles Hockett and, most notably, Noam Chomsky, began to apply and adapt these tools to understanding how language might be produced and comprehended. 

In another thread of research, Claude Shannon began studying the problem of transmission of information under conditions of uncertainty, and laid the foundations for the modern field of *information theory*. These tools were also quickly adapted to be used in the study of problems of the mind by researchers such as George Miller, and in the case of language, Charles Hockett. 

The ideas of  these early researchers still form the foundations the modern fields of linguistics, artificial intelligence, and natural language processing. In this course, we will study these foundations with the goal of understanding the logic of how the tools can be applied to build models of language. Along the way, we will acquire many of the conceptual tools still needed to read the modern literature in natural language processing. However, the goal is not only to understand how such models work, but to be able to critically evaluate how computational models advance our scientific understanding of language. 

But first, we need a model of computation....

# The $$\lambda$$-Calculus and LISP

In this course, we will use the lambda calculus as our basic model of computation. The $$\lambda$$-calculus was introduced by Alonzo Church in the 1930s as a computable model of mathematical logic. Church based this model on mathematical *functions* applied to arguments, building up complex computable functions (originally representing logical expressions) from simple ones. In his famous paper introducing the Turing machine, Alan Turing showed that Church's $$\lambda$$-Calculus and Turing machines were equivalent in the sense that they computed the same set of functions. In  1960, John McCarthy introduced LISP, one of the first practical programming languages, based on the $$\lambda$$-Calculus using list-based data structures (hence the name LISt Processor).

LISP was the first programming language in the paradigm that became known as *functional programming* which now includes languages such as Haskell, ML, Erlang, and some aspects of popular imperative programming languages such as Java (e.g., Guy Steele, the designer of Java, also was the designer of the LISP dialect known as Scheme). The behavior of functional programs is often easier to reason about than imperative programs and easier to parallelize. Thus, these languages have become important again in recent years after a period of less popularity. Functional languages also form the basis for most *probabilistic programming languages*&mdash;high-level programming languages that make it easy to specify probabilistic models. The [Church](http://projects.csail.mit.edu/church/wiki/Church) programming language is one inspiration for this course.  The $$\lambda$$-calculus is also the main computational tool used in formal semantics as studied in linguistics. Thus, a thorough understanding of the $$\lambda$$-calculus will be helpful in many areas beyond this course. 

We will use a variant of LISP called [Clojure](https://clojure.org/). Althought the language is very powerful, the basic syntax of Clojure is very simple and can be learned in a few minutes. In the next few sections, we will discuss the basics of Clojure, before proceeding to use the language to begin our study of language using these tools. 

## Functions

The most important operation in the  $$\lambda$$-calculus is the application of a function (also called a *procedure* in LISP) to some arguments. In LISP, procedure application is expressed in Polish notation like so: <tt>(function argument1 argument2)</tt>. For example, we can add 1 and 2 as follows. 

~~~
(+ 1 2)
~~~


There are a few things to note about the example above. First, the bit of code <tt>(+ 1 2)</tt> is called an *expression* in LISP. An expression is any syntactically well-formed piece of code that can be run or *evaluated* by the LISP interpreter. The process of computing the output of an expression by running the interpreter on it is called *evaluation* in LISP. The result is known as the *value* of the expression. The notion of expression is very important in functional programming languages because they are used to define the behavior of the interpreter.

We will see many different kinds of LISP expressions and it is important to understand how the interpreter evaluates each kind of expression in the language. This particular kind of expression starts with an open parenthesis, is followed by the name of a procedure and then some number of arguments and, finally, ends with a close-parenthesis. Combinations are the way we instruct the intperpreter to apply a function to some arguments.  The combination above applies the *primitive procedure*: <tt>+</tt> is a *variable* to the *arguments* <tt>1</tt> and <tt>2</tt>. These arguments are *constants* with the *primitive type* of *integer*.  The primitive procedure applied to those two constant inputs returns the value <tt>3</tt> also of type integer.

Of course the true power of LISP comes from the ability to define new procedures that perform new computations, not just from using existing primitives. The operator that allows the definition of new functions in the $$\lambda$$-calculus is called $$\lambda$$ and is what gives the  $$\lambda$$-calculus its name. In Clojure we write <tt>fn</tt> instead of $$\lambda$$. The general form of a $$\lambda$$ expression in Clojure looks like this:  <tt>(fn [...parameters...] ...body...)</tt>. 

```
(fn [x y] (+ x y))
```

Note what happens when we evaluate the expression above. The value of a $$lambda$$/<tt>fn</tt> expression is a function. 

Let's take a look at the definition above. It has three parts. First, there is the  <tt>fn</tt> operator. Second, there is a list of *formal parameters* to the procedure. These are variables that will hold the values of inputs to the procedure. In this case, this includes <tt>x</tt> and <tt>y</tt>. Third there is the procedure *body* which expresses the computation performed by the procedure. In this case, the body simple adds the values stored in the two variables. 

How can we use a $$\lambda$$-defined procedure? Consider the following example. 

```
((fn [x y] (+ x y)) 1 2)
```

This is a little hard to parse at first, but with a little effort you can see that this code snippet is similar to <tt>(+ 1 2)</tt> but with <tt>+</tt> replaced with the procedure definition <tt>(fn [x y] (+ x y))</tt>. In this example, the procedure is constructed and them immediately applied to the arguments <tt>1</tt> and <tt>3</tt> to compute the output value <tt>3</tt>, and then "forgotten" by the language. How can we make a function that doesn't disappear?

## Naming things with <tt>def</tt>

One mechanism we can use to make things which dont' disappear is by naming them with a *variable*.  In Clojure we can create named variables with the <tt>def</tt> primitive.

```
(def x 1)
```

<tt>def</tt> *binds* the value <tt>1</tt> to the variable called <tt>x</tt>. The name of a variable, like <tt>x</tt>, is a special kind of expression called a *symbol*. Symbols are evaluated by the interpreter by looking up value that has been associated with the variable of that name.

```
(def x 1)
(+ x x)
```
Now when we run the expression <tt>(+ x x)</tt> the language first looks up the value of the variable <tt>x</tt> and then applies the function <tt>+</tt> to this value (twice).  We can also use <tt>def</tt> to name functions created with <tt>fn</tt>.

```
(def my-addition (fn [x y] (+ x y)))
```
Now we have a function named <tt>my-addition</tt> which is defined using the <tt>fn</tt> term we introduced above. Note an important fact, for Clojure there is no difference between binding a number like <tt>1</tt> to a variable-name like <tt>x</tt> or a function to a variable name like <tt>my-addition</tt>. Functions are *first class*, they are simply a type of object in the system like any other.

```
(def my-addition (fn [x y] (+ x y)))
(my-addition 1 2)

(def x 1)
(my-addition x x)
```

Because we very frequently need to define procedures, Clojure provides a shorthand for doing this. Instead of writing <tt>(def my-addition (fn [parameters] body))</tt> in Clojure we can also write <tt>(defn my-addition [parameters] body))</tt>, which means the same thing. 

```
(defn my-addition [x y] (+ x y))
(my-addition 1 2)
```
## Some basic datatypes

### Symbols So far we have seen two three datatypes in our system: numbers like <tt>1</tt> and <tt>2</tt>, functions returned by <tt>fn</tt> and variable names used in <tt>def</tt> statements and <tt>fn</tt> definitions like <tt>x</tt> and <tt>my-addition</tt>. As mentioned abover, this last kind of object is called a *symbol* in LISP. When Clojure sees a symbol it assumes this is a variable and it tries to look up the value for that variable. That is, symbols should evaluate to the value bound to the variable with that name. If the variable has not been bound to value, you will get a special value in Clojure called <tt>nil</tt>.

```
some-symbol
```

What if we want to talk about the symbol itself, instead of always assuming that it is the name of a variable bound to some value? In this case, we can use the <tt>quote</tt> procedure. The quote procedure takes its argument and returns a *quoted* version of that argument. Quoted values are treated **as is** by the language. That is, they are their own value. 

```
(quote some-symbol)
```

```
(def my-variable (quote some-symbol))
my-variable
```

In the expression above, we created a variable called <tt>my-variable</tt> and bound it to the value of the expression <tt>(quote some-symbol)</tt>. We then asked Clojure to interpret the symbol <tt>my-variable</tt>. The language assumed that the symbol <tt>my-variable</tt> was a variable, and looked up its value which, thanks to the quote, was the **symbol** <tt>my-symbol</tt>. Since we frequently want to quote expressions, Clojure provides a shorthand for this. Any expression preceded by a single quote <tt>'</tt> is considered to be quoted in the language.

```
'some-symbol
```

```
(def my-variable 'some-symbol)
my-variable
```


### Strings

In addition to numbers, procedures, and symbols, LISP also has strings. A string is written <tt>"some string"</tt>.

```
(def my-string "some string")
```

<!-- HERE -->
### Lists

We have actually already seen many examples of lists in our code above. In Clojure lists are written as a sequence of things appearing between parenthese <tt>(v1 v2 v3 ...)</tt>. Much of the code we have seen so far consists of lists. In particular, combinations are just lists. When the Clojure gets a list as input, it assumes that this is a combination and tries to apply the function in the first position to the arguments in the rest of the positions (more on this later). We can explicitly construct a list using the <tt>list</tt> procedure.

```
(list 1 2 3)
```

We can also use the non-transparently named <tt>cons</tt> procedure in order create a new list, with an element added on to it.

```
(cons 0 (list 1 2 3))
```

The procedures <tt>rest</tt> can be thought of as the partial inverse of <tt>cons</tt>. It returns a list with the first element removed.

```
(rest (list 0 1 2 3))

(rest (cons 0 (list 1 2 3)))

```

A combination is just a list with a procedure in the first position.

```
(list (fn [x y] (+ x y)) 1 2)
```

The result of evaluating the expression above is a list with a procedure in the first position and the values <tt>1</tt> and <tt>2</tt> in the second and third position. This combination can be evaluated to produce an output using the <tt>eval</tt> procedure which evalutes an expression to get a value.

```
(eval (list (fn [x y] (+ x y)) 1 2))
```

We can also quote a list to prevent the language from treating it as a combination. 

```
'(1 2 3)
```

There is an important special case of lists in LISP which is usually written <tt>'()</tt> but in Clojure can also be written as <tt>nil</tt>. This is the empty list (in fact, it is the object representing "nothing") and is very important for reasons we will see below. We could also get the empty list by calling <tt>list</tt> with no arguments like this <tt>(list)</tt>. 

```
'()
```

```
(list)
```

### Booleans

Another important datatype in LISP are *boolean values* *true* and *false*. In Clojure these are written <tt>true</tt> and <tt>false</tt>. For example, we can check the equality of two objects with the <tt>=</tt> procedure which returns if the two objects are the same (structurally) and false otherwise. 

```
(= '(1 2) '(1 2))
(= '() (list))
(= '(1 2) (list 1 2))
(= '(1 2) (list 1 2 3))
```

In LISP, programmers usually follow the convention that boolean-valued functions, also known as *predicates* end in a question mark. Another important predicate we will see below is the predicate <tt>empty?</tt> which checks if its argument is an empty list/collection. 

```
(empty? '())
(empty? (list 1 2 3))
```

### The Structure of Lists and Recursion

The examples above show how lists can be built using the <tt>list</tt> constructor or by quoting. One useful way of thinking of a list is just as a sequence of pairs where the last element in the sequence is the empty list like this: <tt>(cons 1 (cons 2 (cons 3 ()))</tt>

```
(cons 1 (cons 2 (cons 3 '())))
(list 1 2 3)
```

So <tt>(list 1 2 3)<tt> does indeed appear to be a pair of the value <tt>1</tt> and another list <tt>(2 3)</tt>; this latter list is just a pair of the value <tt>2</tt> and another list <tt>(3)</tt>, and so on, with the last element in the sequence being the empty or null list <tt>()</tt>. (This is a literally accurate claim about the structure of lists in many LISP languages; in Clojure, the internal representations are more complicated, but this is still a useful picture to have.)

We can use <tt>first</tt> and <tt>rest</tt> to navigate around this list.

```
(first (list 1 2 3))

(rest (list 1 2 3))
```

The structure of lists is important because it goes hand in hand with the most important code design pattern used in the $$\lambda$$-calculus, and functional programming more generally: *recursion*. We can process a list by defining a function which does something to the first element of the list, and calls itself recursively on the rest of the list. The base case of such a recursive list processing procedure is the empty list <tt>()</tt>.

Before illustrating the concept of recursion. We need to introduce one more programming concept: *conditionals*. *Conditional* is a fancy word for an *if...then* structure. In Clojure, conditionals start with <tt>if</tt> and have three parts <tt>(if  boolean-condition consequent alternative)</tt>. The boolean condition is any boolean expression. If it is true, the expression in the consequent position is evaluated and its value is returned as the value of the whole conditional expression. If the boolean condition is false the expression in the alternative is evaluated and its value is returned as the value of the whole conditional. Note that unlike in many imperative programming languages, conditionals have values in functional languages just like any other expression. 

```
(if (= 1 2) 'true 'false)

(if (= 1 1) 'true 'false)
```

With conditionals, we are now ready to define recursive list-processing functions. One extremely important and basic list-processing function that exists in all functional languages is known as <tt>map</tt>. <tt>map</tt> is a *high-order* function which takes to arguments: <tt>(map f l)</tt>. First, it takes a one-place procedure <tt>f</tt> and second it takes a list <tt>l</tt>. It then returns the list that results from applying <tt>f</tt> to each element of <tt>l</tt>. 

```
(map (fn [x] (+ x 1) ) '(1 2 3 4 5 6))
```

In the example above, we called <tt>map</tt> with two arguments. First, we passed in an unnamed or *anonymous* function <tt>(fn [x] (+ x 1))</tt> which simply adds one to whatever it is passed as an argument. Second, we passed in the list <tt>(1 2 3 4 5 6)</tt>. <tt>map</tt> applied this anonymous function to each element of the list and returned the result. 

<tt>map</tt> is a standard function in all functional programming languages because it is a common use case for iteration. But it is easy to define it ourselves using recursion.

```
(def my-map (fn [f l]
              (if (empty? l)
                '()
                (cons (f (first l))
                  (my-map f (rest l))))))


(my-map (fn [x] (+ 1 x)) '(1 2 3 4 5 6))
```

Let's go through this function definition. First, the function takes two arguments <tt>f</tt> another function, and a list <tt>l</tt>. The body of the procedure is a conditional. This conditional first checks if the list <tt>l</tt> is the empty list using the built in procedure <tt>empty?</tt>. If the list passed to <tt>my-map</tt> is empty, then the result must also be empty, so we set the consequent of the conditional to just the empty list. On the other hand, if there are elements in the list <tt>l</tt>, we need to do more work.

The alternative to the conditional first gets the first elements of <tt>l</tt> with <tt>first</tt>, i.e., <tt>(first l)</tt> and it then applies the function <tt>f</tt> to this element. Second, it calls itself on the remainder of the list which it gets using <tt>rest</tt>. Finally, it takes the result of these two operations and creates a pair from these using "cons". 

Let's look at another example of recursion.

```
(def sum (fn [l]
           (if (empty? l)
             0
             (+ (first l) (sum (rest l))))))

```

This function takes a list of numbers, and returns the sum of those numbers. The recursion in this definition says something very simple (but important) about summing a list: the sum of a list is equal to the first number in the list plus *the sum of the rest of the list*.

It is impossible to exaggerate how important this kind of recursion is for models of natural language structure, as we will see in subsequent parts of the course.
