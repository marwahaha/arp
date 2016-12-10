ARP
===

A very simple language. Aims to be lisp-like, self hosted and statically typed.

To do so we first create a very simplified version of it called **arp0** on some
external language. This version has the most fundamental semantics and functions
subset. With that we can create **arp1**, that implement the complete semantics,
and so translates arp code to arp0 code.

With arp1 we can implement our standard library and then have a *complete* arp
environment. This environment is constrained, but with it we can run the arp*
(or just arp), our self-hosted compiler. And arp* then compile itself,
giving us the unconstrained version of arp environment.

The process is futher summarized on the following diagram:

```
External Language
        ^
        |
        |
       arp0
        ^
        |
        |
       arp1
        ^ ^
        |  \
        | stdlib
        | ^
        |/
        |  
       arp*
       ^  \
        \_/  
```

The syntax
==========

We have a very simple syntax:

```
program ::= list ;
list    ::= { element } ;
element ::= symbol | "[", list ,"]" ;
symbol  ::= (* Any valid character except "[", "]", control characters and space*);
```

So those are sintatically valid programs:

```
Hello World
```

```
Hello
World
```

```
[[Hello] World]
```

But these are invalid ones:

```
]Hello[
```

```
[[[[Hello]
```

Semantics
=========
Semantically, given the an ast as a list we walk each element in that list and
evaluate it as follows:

- If the element is a symbol, *return* the value associated with that
  symbol, if any, otherwise it is an error;
- If the element is a list, then it evaluate its head (first element) and:
    - If it is a macro, calls it with the list's tail as parameters and *return*
      its return value;
    - If it is a function, evals the tail's elements, and then calls the
      function with the evaluated tail as parameters.
    - Otherwise evaluate it again the evaluated head and *return* its result. The
      tail must be empty, being an error otherwise.

### Examples

Given that `A` is associated with number `9`, `B` is
associated with symbol `A` and `C` is associated with the square root function,
these programs below are valid and return the following results:

Program | Evals to
------- | --------------------
 `A`    | 1
 `B`    | A
 `C`    | Square root function
 `[B]`  | 1
 `[C A]`| 3

Intrisic values
===============

These symbols have predefined values.

Symbol  | Value
------- | ----------------
 T!     | boolean true
 F!     | boolean false

Intrisic macros
===============

As it is obvious from example before, our language can't do anything if we don't
have some symbols already defined. This table bellow has the predefined macros.
By convention, every macro is posfixed by '!'. The following section presents
their

literal!
--------

 | return its first parameter as it is (unevaluated)
