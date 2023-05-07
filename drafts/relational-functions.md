---
layout: post
title: Relational functions
tags: language
---

I happen to like relational algebra as a means of programming. However SQL
doesn't really win any prizes in modularity and extnesibility. To this end I
was thinking that a unification with functional programming might give us more
power to express high level concerns.

For example it has happend on occation that I wanted to join the set of
naturals with a calculation. Most databases I've worked with doesn't have much
love for infinite --- or even generated --- sets so it usually ends with some
ugly hack like:

    SELECT LEVEL
    FROM DUAL 
    CONNECT BY LEVEL <= 100

Another failing with SQL, or rather RDBMS-systems as they are today, is the
poor integration between the DB and the application. Sending strings back and
forth with no real possiblity for either end of the connection to do static
analysis seems very wasteful to me.

So with an eye towards [The Third Manifesto] I will try to design a language
core that can be used for a more integrated database application language.
While we're at it we should also aim for a semantics that'll enforce a 6NF
model of ones domain.

[The Third Manifesto]: http://www.thethirdmanifesto.com/

To get started it will probably be a good idea to find the common roots of
functional theory and relational theory, and extend both in a manner that merge
them into one coherent theory.

A function can be seen as a subset of the cartesian product of two sets, it's
*domain* and its *codomain*. This subset is further more constrained so that
elements from the domain contributes exactly one element. If not all elements
of the domain are present the function is said to be partial.

A relation is defined as a *tuple* of a *header* and a *body* where the header
is a set of names and the body is a set of tuples with the header as domain. A
tuple here is defined as a partial function from names to values.

As a first unification step we define a cartesian product to yield a tuple in
this sense.

Before we continue I think it would be appropriate to invent a syntax to
represent what we are talking about. First of all it seems that name matching
functions plays a central role in this world so lets start there. JSON fits our
needs in this regard so lets take that. We extend it slightly as a general set
literal.

So lets consider a function like *xor*. In JSON notation it could be expressed
like:
    { "xor": { "T" : { "T" : "F",
                       "F" : "T" },
               "F" : { "T" : "T",
                       "F" : "F" } } }

However in keeping with the definition we need a triple like so:
    { "xor" { "domain":   { { "op1":"T", "op2":"T" },
                            { "op1":"T", "op2":"F" },
                            { "op1":"F", "op2":"T" }.
                            { "op1":"F", "op2":"F" } },
              
              "codomain": { { "res":"T" },
                            { "res":"F" } },

              "mappings": { "domain": { { "op1":"T", "op2":"T"}, "codomain": {"res":"F" } },
                          { "domain": { { "op1":"F", "op2":"T"}, "codomain": {"res":"T" } },
                          { "domain": { { "op1":"T", "op2":"F"}, "codomain": {"res":"T" } },
                          { "domain": { { "op1":"F", "op2":"F"}, "codomain": {"res":"F" } },


The relational version would be something like
    { "xor": { "header" : {   "op1",     "op2",     "res"     },
               "body"   : { { "op1":"T", "op2":"T", "res":"F" },
                            { "op1":"T", "op2":"F", "res":"T" },
                            { "op1":"F", "op2":"T", "res":"T" },
                            { "op1":"F", "op2":"F", "res":"F" } } }
                          
