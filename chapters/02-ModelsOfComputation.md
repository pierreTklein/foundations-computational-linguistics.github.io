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

<br/>
```
(+ 1 2)
```
<br/>

There are a few things to note about the example above. First, the bit of code <tt>(+ 1 2)</tt> is called an *expression* in LISP. An expression is any syntactically well-formed piece of code that can be run or *evaluated* by the LISP interpreter. The process of computing the output of an expression by running the interpreter on it is called *evaluation* and the result is known as the *value* of the expression. The notion of expression is very important in functional programming languages because they are used to define the behavior of the interpreter. We will talk much more about this below.

In LISP, every expression and every value has a *type*. The type of the expression tells the LISP interpreter what to do with that expression. The expression <tt>(+ 1 2)</tt> is of type *list* in Clojure and consists of three *subexpressions*: the *primitive procedure* or *primitive function*: <tt>+</tt>, and it's *arguments* <tt>1</tt> and <tt>2</tt> which are *constants* of primitive type *integer*. List expressions like  <tt>(+ 1 2)</tt>&mdash;where the first element of the list is a procedure and the remaining elements are arguments to that procedure&mdash;have a special name in LISP. They are called a *combination*. Whenever the interpreter sees a combination, it tries to apply the function in the first position to the values of the expressions in the argument positions.

LISP is a *homoiconic*  language. This means that LISP code itself is built out of the same datatypes that are processed by the language when code is run. In LISP you may write a program which takes lists as inputs and produces lists as outputs. But the program itself will also be expressed using lists, numbers, and other fundamental LISP datatypes. We will see below how this makes it easy to reason about the behavior of LISP code.

The true power of LISP comes from the ability to define new procedures that perform new computations&mdash;not just from using existing primitive functions. The operator that allows the definition of new functions in the $$\lambda$$-calculus is called $$\lambda$$ and is what gives the  $$\lambda$$-calculus its name. In Clojure we write <tt>fn</tt> instead of $$\lambda$$. The general form of a $$\lambda$$ expression in Clojure looks like this:  <tt>(fn [...parameters...] ...body...)</tt>. 

<br/>
```
(fn [x y] (+ x y))
```
<br/>


Let's take a look at the definition above. It has three parts. First, there is the  <tt>fn</tt> operator. Second, there is a list of *formal parameters* to the procedure. These are variables that will hold the values of inputs to the procedure. In this case, this includes <tt>x</tt> and <tt>y</tt>. Third there is the procedure *body* which expresses the computation performed by the procedure. In this case, the body simple adds the values stored in the two variables. Note what happens when we evaluate the expression above. The **value** of a $$\lambda$$/<tt>fn</tt> expression is a function.


How can we use a $$\lambda$$-defined procedure? Consider the following example. 

<br/>
```
((fn [x y] (+ x y)) 1 2)
```
<br/>

This is a little hard to parse at first, but with a little effort you can see that this code snippet is similar to <tt>(+ 1 2)</tt> but with <tt>+</tt> replaced with the procedure definition <tt>(fn [x y] (+ x y))</tt>. In this example, the procedure is constructed and them immediately applied to the arguments <tt>1</tt> and <tt>3</tt> to compute the output value <tt>3</tt>, and then "forgotten" by the language. How can we make a function that doesn't disappear like this?

## Naming things with <tt>def</tt>

One mechanism we can use to make things which don't disappear is by naming them with a *variable*.  In Clojure we can create named variables with the <tt>def</tt> primitive.
<!-- TODO: say more about variables, for example, explain their two parts the name and the value? -->

<br/>
```
(def x 1)
```
<br/>

<tt>def</tt> *binds* the value <tt>1</tt> to the variable called <tt>x</tt>. The name of a variable, like <tt>x</tt>, is a special kind of expression called a *symbol*. Symbols are evaluated by the interpreter by looking up value that has been associated with the variable of that name.

<br/>
```
(def x 1)
(+ x x)
```
<br/>

Now when we run the expression <tt>(+ x x)</tt> the language first looks up the value of the variable <tt>x</tt> twice and then applies the function <tt>+</tt> to the two resulting values (which, of course, are equal).  We can also use <tt>def</tt> to name functions created with <tt>fn</tt>.

<br/>
```
(def my-addition (fn [x y] (+ x y)))
```
<br/>

Now we have a function named <tt>my-addition</tt> which is defined using the <tt>fn</tt> term we introduced above. Note an important fact, for Clojure there is no difference between binding a number like <tt>1</tt> to a variable-name like <tt>x</tt> or a function to a variable name like <tt>my-addition</tt>. Functions are *first class*, they are simply a type of object in the system like any other. They can be passed as values to other functions, assigned to variables, stored in data structures, etc.

<br/>
```
(def my-addition (fn [x y] (+ x y)))
(my-addition 1 2)

(def x 1)
(my-addition x x)
```
<br/>

Because we very frequently need to define procedures, Clojure provides a shorthand for doing this. Instead of writing <tt>(def my-addition (fn [parameters] body))</tt> in Clojure we can also write <tt>(defn my-addition [parameters] body))</tt>, which means the same thing. 

<br/>
```
(defn my-addition [x y] (+ x y))
(my-addition 1 2)
```
<br/>

## Some basic datatypes

All expressions and values in LISP have a type. In this section, we discuss some of the most important types in the programming language.

### Symbols

Above, we discussed vairables. A variable is named location in memory that stores some value for us. The kinds of things that can be the names of variables in LISP are a special datatype known as a *symbol*.  Whenever the Clojure interpreter encounters an expression which is of type symbol, it assumes it is the name for a variable and tries to evaluate the symbol by looking up the value stored with the variable. That is, symbols evaluate to the value bound to the variable with that name. If the variable has not been bound to value, you will get a special value in Clojure called <tt>nil</tt> which is Clojure's way of referring to "nothing."

<br/>
```
x
some-symbol
```
<br/>

What if we want to talk about the symbol itself, instead of always assuming that it is the name of a variable bound to some value? In this case, we can use the <tt>quote</tt> special form. <tt>quote</tt> takes an argument and returns a *quoted* version of that argument. Quoted values are treated **as is** by the interpreter. In other words, the interpreter doesn't try to apply its normal rules to anything within a <tt>quote</tt>, the contents of a quoted expression is the expression itself.

<br/>
```
(quote some-symbol)
(def my-variable (quote some-symbol))
my-variable
```
<br/>

In the expression above, we created a variable called <tt>my-variable</tt> and bound it to the value of the expression <tt>(quote some-symbol)</tt>. We then asked Clojure to interpret the symbol <tt>my-variable</tt>. The language assumed that the symbol <tt>my-variable</tt> was a variable, and looked up its value which, thanks to the quote, was the **symbol** <tt>my-symbol</tt>. Since we frequently want to quote expressions, Clojure provides a shorthand for this. Any expression preceded by a single quote <tt>'</tt> is considered to be quoted in the language.

<br/>
```
'some-symbol
(def my-variable 'some-symbol)
my-variable
```
<br/>


### Strings

In addition to numbers, procedures, and symbols, LISP also has strings. A string is written <tt>"some string"</tt>.

```
(def my-string "some string")
```
<br/>

### Lists

In Clojure lists are written as a sequence of things appearing between parenthese <tt>(v1 v2 v3 ...)</tt>. Lists are perhaps the most important and common type of expression in Clojure. In particular, combinations, <tt>fn</tt>-expressions, <tt>quote</tt>-expressions, and several other special kinds of expressions we will see below are all expressed as lists in LISP code. 

We can explicitly construct a list using the <tt>list</tt> procedure.

<br/>
```
(list 1 2 3)
```
<br/>

In Clojure, we can add a single value on to the beginning of a list using the  <tt>cons</tt> procedure.

<br/>
```
(cons 0 (list 1 2 3))
```
<br/>

If we want to take the first element off of a list, we can use the <tt>rest</tt> primitive. It returns a list with the first element removed.

<br/>
```
(rest (list 0 1 2 3))

(rest (cons 0 (list 1 2 3)))
```
<br/>

If we want to retrieve just the first element of a list, we can use the <tt>first</tt> primitive.

<br/>
```
(first (list 0 1 2 3))

(first (cons 0 (list 1 2 3)))
```
<br/>

A combination is just a list with a procedure in the first position.

<br/>
```
(list (fn [x y] (+ x y)) 1 2)
```
<br/>

The result of evaluating the expression above is a list with a procedure in the first position and the values <tt>1</tt> and <tt>2</tt> in the second and third position. This combination can be evaluated to produce an output using the <tt>eval</tt> procedure which evalutes an expression to get a value. Because LISP is homoiconic, <tt>eval</tt> which runs the interpreter on an expression, is just another LISP function.

<br/>
```
(eval (list (fn [x y] (+ x y)) 1 2))
```
<br/>

We can also quote a list to prevent the language from treating it as a combination. 

<br/>
```
'(1 2 3)
(1 2 3)
```
<br/>

There is an important special case of lists in LISP which is usually written <tt>'()</tt>. This is the empty list (in fact, it is the object representing "nothing") and is very important for reasons we will see below. We could also get the empty list by calling <tt>list</tt> with no arguments like this <tt>(list)</tt>. 
<br/>
```
'()
(list)
```
<br/>

Note the use of the quote symbol in <tt>'()</tt> the empty list in LISP is actually displayed as <tt>()</tt>. But, to prevent the interpreter from thinking this is a combination and trying to apply no function to nothing, we quote the list so that interpreter simply evaluates the empty list to itself.


### Booleans

Another important datatype in LISP are the *boolean values*: *true* and *false*. In Clojure these are written <tt>true</tt> and <tt>false</tt>. For example, we can check the equality of two objects with the <tt>=</tt> procedure which returns <tt>true</tt> if the two objects are the same (structurally) and <tt>false</tt> otherwise.

<br/>
```
(= '(1 2) '(1 2))
(= '() (list))
(= '(1 2) (list 1 2))
(= '(1 2) (list 1 2 3))
```
<br/>

In LISP, programmers usually follow the convention that boolean-valued functions, also known as *predicates*, end in a question mark. An important predicate we will see below is the predicate <tt>empty?</tt> which checks if its argument is an empty list/collection.

<br/>
```
(empty? '())
(empty? (list 1 2 3))
```
<br/>

On very important kind of expression that relies on booleans in LISP is the *conditional expression*. Conditional is a fancy word for an *if...then* structure. In Clojure, conditionals start with <tt>if</tt> and have three parts <tt>(if boolean-condition consequent alternative)</tt>. The boolean condition is any boolean expression. If it is true, the expression in the consequent position is evaluated and its value is returned as the value of the whole conditional expression. If the boolean condition is false, the expression in the alternative is evaluated and its value is returned as the value of the whole conditional. Note that unlike in many imperative programming languages, conditionals have values in functional languages just like any other expression.

<br/>
```
(if (= 1 2) 'hi 'bye)

(if (= 1 1) 'hi bye)
```
<br/>

Conditionals in functional programming languages illustrate the important fact that **all expressions have a value**. In most imperative languages, and if-then statement itself has no value, but simply passes control to one branch or the other, depending on the value of the boolean-condition. In functional languages, however, the whole expression has the value of the succeeding branch.

### The Structure of Lists and Recursion

The examples above show how lists can be built using the <tt>list</tt> constructor or by quoting. But there is a more useful and fundamental way to think about the structure of lists which we will make extensive use of in this course. 


One useful way of thinking of a list is just as a sequence of applications of the <tt>cons</tt> procedure, starting from the empty list: <tt>(cons 1 (cons 2 (cons 3 ()))</tt>

<br/>
```
(cons 1 (cons 2 (cons 3 '())))
(list 1 2 3)
```
<br/>

So <tt>(list 1 2 3)<tt> can be built by applying <tt>cons</tt> to the value <tt>1</tt> and another list <tt>(2 3)</tt>; this latter list can be built by applying <tt>cons</tt> to the value <tt>2</tt> and another list <tt>(3)</tt>, and so on, with the last element in the sequence being the empty or null list <tt>()</tt>.

We can use <tt>first</tt> and <tt>rest</tt> to navigate around this list.

<br/>
```
(first (list 1 2 3))

(rest (list 1 2 3))
```
<br/>

The structure of lists is important because it goes hand in hand with the most important code design pattern used in the $$\lambda$$-calculus, and functional programming more generally: *recursion*. We can process a list by defining a function which does something to the first element of the list, and calls itself recursively on the rest of the list. The base case of such a recursive list processing procedure is the empty list <tt>()</tt>.

Recursion is best explained with an example. One extremely important and basic list-processing function that exists in all functional languages is known as <tt>map</tt>. <tt>map</tt> is a *high-order* function which takes two arguments: <tt>(map f l)</tt>. Its first argument is a one-place procedure <tt>f</tt> and its second second is  a list <tt>l</tt>. It then returns the list that results from applying <tt>f</tt> to each element of <tt>l</tt>. 

<br/>
```
(map (fn [x] (+ x 1) ) '(1 2 3 4 5 6))
```
<br/>

In the example above, we called <tt>map</tt> with two arguments. First, we passed in an *unnamed* or *anonymous* function <tt>(fn [x] (+ x 1))</tt> which simply adds one to whatever it is passed as an argument. Second, we passed in the list <tt>(1 2 3 4 5 6)</tt>. <tt>map</tt> applied the anonymous function  <tt>(fn [x] (+ x 1))</tt> to each element of the list <tt>(1 2 3 4 5 6)</tt>  and returned the result <tt>(2 3 4 5 6 7)</tt>. 

<tt>map</tt> is a standard function in all functional programming languages because it is a common use case for iteration. But it is easy to define it ourselves using recursion.

<br/>
```
(def my-map (fn [f l]
              (if (empty? l)
                '()
                (cons (f (first l))
                  (my-map f (rest l))))))


(my-map (fn [x] (+ 1 x)) '(1 2 3 4 5 6))
```
<br/>

Let's go through this function definition. First, the function takes two arguments: a function <tt>f</tt> and a list <tt>l</tt>. The body of the procedure is a conditional. This conditional first checks if the list <tt>l</tt> is the empty list using the built in procedure <tt>empty?</tt>. If the list passed to <tt>my-map</tt> is empty, then the result must also be empty, so we set the value of the conditional to just the empty list. On the other hand, if there are elements in the list <tt>l</tt>, we need to do more work.

The alternative to the conditional first gets the first elements of <tt>l</tt> with <tt>first</tt>, i.e., <tt>(first l)</tt> and it then applies the function <tt>f</tt> to this element. Second, it calls itself on the remainder of the list which it gets using <tt>rest</tt>. Finally, it takes the result of these two operations and creates a pair from these using <tt>cons</tt>. 

Let's look at another example of recursion.

<br/>
```
(def sum (fn [l]
           (if (empty? l)
             0
             (+ (first l) (sum (rest l))))))

```
<br/>

This function takes a list of numbers, and returns the sum of those numbers. The recursion in this definition says something very simple (but important) about summing a list: the sum of a list is equal to the first number in the list plus the sum of the rest of the list.

It is impossible to exaggerate how important this kind of recursion is for models of natural language structure, as we will see in subsequent parts of the course.
