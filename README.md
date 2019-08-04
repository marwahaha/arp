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
Semantically, we look at the ast as a list and we walk each element on it,
evaluating as follows:

- If the element is a symbol, *return* the value associated with that
  symbol, if any, otherwise it is an error;
- If the element is an empty list, it return an empty list.
- If the element is a non-empty list, then it evaluate its head (first element) and:
    - If it is a macro, calls it with the list's tail as parameters and *return*
      its return value;
    - If it is a function, evals the tail's elements, and then calls the
      function with the evaluated tail as parameters.
    - Otherwise evaluate it again the evaluated head and *return* its result. The
      tail must be empty, being an error otherwise.

The value returned by the last element is the return value of the program.

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

As it is obvious from example before, our language can't do anything if we don't
have some symbols already defined. So the following are the predefined symbols,
separated in values, macros and functions.

Intrisic values
===============

These symbols have predefined values.

Symbol  | Value
------- | ----------------
 T!     | boolean true
 F!     | boolean false

Intrisic macros
===============

We use some simple anotation below, in the form: `SIGNATURE => RESULT;`.
The SIGNATURE is how you call the macro, the RESULT is its returned value. Side
effects are defined on the text bellow it. symbols in lower cases or puncutation
means to be let as it is, symbols in upper case are to be replaced by some
suitable value, also to be mentioned on the text bellow it. We also use the
convention of naming all macros with the '!' posfix.

literal! (!)
------------

    [! ELEMENT1] => ELEMENT1
    [literal! ELEMENT1] => ELEMENT1

This is the "literal!" macro. It returns its first parameter unevaluated.
It is useful to use symbols or lists as values themselves.
It is so useful that it can be abbreviated as just `!`.

let!, let-mut!
--------------

    [let! S V] => [V]
    [let-mut! S V] => [V]

This is the binding command. It binds the computed value of V (the result of[V])
to the given symbol S on the current scope. It is an error if S is not a symbol.
Binding a Symbol that was already binded in the current scope is an error.
Calling a mutating operation on S is only permitted if S was binded with
`let-mut`, being an error otherwise.

The command will return the value that was binded to S, that is, the [V].

assign!
-------

    [assign! S V] => [V]

The assign command, similar to `=` and `:=` on other languages. It:

- If the current scope has S binded as mutable and its value type is the same
  as the type of [V], it assign [V] to [S].
- If the current scope doesn't have S binded, but is a derived scope, then
  recursivelly tries to assign at the base scope, the same rules apply.
- If the current scope has S binded as immutable or its value type is not the same
  as the type of [V], it is an error.
- If the current scope doesn't has S binded and it also is not a derived scope,
  then it is also an error.

decide!
-------

    [decide! C T F] => [T] | [F]

The decision command. If [C] is true, it returns [T]. If [C] is false it return
[F]. It is an error if C evals to any other type.

do!
---

    [do! EL1 EL2 ... ELn] => [ELn]

Creates a derived scope from the current one, and evaluates EL1, EL3, ..., ELn in
that scope. The elements are avaluated in sequence and the the result of the
last one is returned by do!. The derived scope is destroyed after that.


loop!
-----

    [loop! EL] => ?

Evaluates the EL (it means [EL]) until it broke from inside. If it is never
broken, it's infinite loop and never return. If it does broke, it returns the
breaking value.

break!
------

    [break! V] => ?

Breaks the innermost loop, which will return [V]. The break itself does not
return anything, as it jumps to another location.

macro!
------

    [macro! PARAM EL] => <macro>

Creates a new macro and return it. The returned macro will, when called,
evaluate [EL], with all occurences of the symbol PARAM replaced by the the
parameter **list**, on a scope derived from the **calling** site. macros are
generally stored with let! using the '!' posfix, as convention, but it is not
mandatory.

###Example

The code below implements a switch statement.

```
[let! switch! [macro! params [do!
  [let! expression [[head params]]]
  [let-mut! cases [tail params]]
  [loop! [do!
    [decide! [empty? cases]
      [break! []]
      []
    ]
    [let! current [head cases]]
    [let! condition [head current]]
    [decide! [= expression [condition]]
      [do!
        [let! value [head [tail current]]]
        [break! [value]]
      ]
      [assign! cases [tail cases]]
    ]
  ]]
]]]
```

An example of using that macro would is bellow. In that example the returned
value would be `isGud`.

```
[switch! [! potato]
  [[! bacon]
    [! isFat]
  ]
  [[! potato]
    [! isGud]
  ]
  [[! beef]
    [! isGudToo]
  ]
]
```

Intrisic Functions
==================

`head`
----

    [head L] => <symbol> | <list>

Returns the first element of a given list. It is an error to call it on an empty
list.

`tail`
----

    [tail L] => <list>

Return the list of elements on L except the head. Calling it on an empty list
returns another empty list.

`empty?`
------

    [empty? L] => <boolean>

Checks if a list is empty.

`node`
----

    [node V L] => <list>

Create a list with V being its head and L being its tail.

`=`
-----

    [= V1 V2] => <boolean>

Compare two values, and return true if equal, false otherwise. The two
parameters must have the same type and it has to be either Symbol or Boolean,
otherwise is an error.
