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
