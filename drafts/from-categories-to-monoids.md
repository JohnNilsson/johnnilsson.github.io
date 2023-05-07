

Monoids in categories
---------------------

We started with a definition of monoids in terms of sets. There is a category of sets called $\textbf{Set}$ in which morphisms are functions between sets. When talking about category theory and programming this is more or less the assumed category.

<pre class="brush: scala">
    object Set extends Category {
      type →[A, B] = A ⇒ B
      def id[A] = { a ⇒ a }
      def compose[A, B, C] = _ andThen _
    }
</pre>

To find our original notion of monoid in this category we need to do some tweaking. First of all we need our set $M$. That is easy enough, $M$ is just one of the objects in $\textbf{Set}$.

Then we need a binary operation on this set. That is, we want a morphism from some object representing some kind of product $M \times M$ to this set. Now, because category theory is about abstracting things as much as possible to make them reusable in other categories with entierly different types of structure, we won't settle for just definig monoids in terms of objects that has a cartesian product. So instead of using $M \times M$ directly we'll take a slight detour to the product category, $\textbf{Set} \times \textbf{Set}$ to define this object.

Given categories $\mathcal{C}$ and $\mathcal{D}$ the product category $\mathcal{C} \times \mathcal{D}$ is roughly equivalent to the cartesian product of sets. It's objects and morphisms are simply pairs of objects and morphisms from $\mathcal{C}$ and $\mathcal{D}$.

<pre class="brush: scala">
    class ProductCategory(val c: Category, val d: Category)
      extends Category with Infix_product_boiler {
      import c.{ → ⇒ ⇀ }, d.{ → ⇒ ⇁ }

      type ⊤ = c.⊤ × d.⊤

      type →[A <: ⊤, B <: ⊤] = (A#L ⇀ B#L) × (A#R ⇁ B#R)

      def id[A <: ⊤] = (c.id[A#L]) × (d.id[A#R])

      def compose[A <: ⊤, B <: ⊤, C <: ⊤] = (m1: A → B, m2: B → C) ⇒ {
        c.compose(m1.l, m2.l) × d.compose(m1.r, m2.r)
      }
    }
</pre>

The <code>Infix\_product\_boiler</code> just adds some boiler plate to allow the \_#L and \_#R types to be extracted. If you know a cleaner way to do this, pleaes let me know.

<pre class="brush: scala">
    trait Infix_product_boiler {
      class ×[+T1, +T2](val l: T1, val r: T2) extends Tuple2(l, r) {
        type L = T1
        type R = T2
      }

      class Infix_×[T1](v1: T1) { def ×[T2](v2: T2) = new ×(v1, v2) }
      implicit def infix_×[T](v: T) = new Infix_×(v)
    }
</pre>


Given $\textbf{Set} \times \textbf{Set}$ we can define a mapping $\otimes: \textbf{Set} \times \textbf{Set} \rightarrow \textbf{Set}$ which includes the mapping $M \times M \rightarrow M \otimes M$ pointing out a source objects for our monoid operation morphism $M \otimes M \rightarrow M$.

Do note that in this definition of the monoid operation there is nothing requiring $M \otimes M$ to actually be the set of pairs from $M$. It can be anything. We do have some laws to respect though to ensure the useful monoidal properties are there.

First of all $\otimes$ should be a functor. A functor is a structure preserving mapping from one category to another. What this means is that given a functor $F: \mathcal{C} \rightarrow \mathcal{D}$  and two morphisms $f,g \in \mathcal{C}$ $$F(f \circ\_\mathcal{C} g) = F(f) \circ\_\mathcal{D} F(g)$$

In scala we have:

<pre class="brush: scala">
    abstract class Functor(val c: Category, val d: Category) {
      import c.→, d.{ → ⇒ ↠ }
      type F[_] <: d.⊤
      def fmap[A <: c.⊤, B <: c.⊤]: (A → B) ⇒ F[A] ↠ F[B]
    }

    abstract class ⊗(c: Category) extends Functor(c × c, c)
</pre>


We need some notion of associativity. That is, if we have object $(M \otimes M) \otimes M$ and $M \otimes (M \otimes M)$ they should be equivalent in some sense with regards to our monoid operation.

...

A category equiped with such a mapping, $(\mathcal{C},\otimes)$, is called a monoidal category. Mppings between categories are called a functors.

Ok enough tech babble lets encode this in Scala as an illustration. First up we'll have to add an upper bound $\top$ to our category definition. We use this to restrict the product category to objects pairs.

<pre class="brush: scala">
    trait Category {
      type ⊤
      type →[_ <: ⊤, _ <: ⊤]

      def id[A <: ⊤]: A → A
      def compose[A <: ⊤, B <: ⊤, C <: ⊤]: (A → B, B → C) => A → C

      def ×[D<:Category](d:D) = new ×(this,d)
    }
</pre>

Now we can define product categories as

<pre class="brush: scala">
    class ×[C <: Category, D <: Category](val c: C, val d: D)
      extends Category with Infix_product_boiler {

      type ⊤ = c.⊤ × d.⊤

      import c.{ → => ⇸ }, d.{ → => ⇻ }
      type →[A <: ⊤, B <: ⊤] = (A#L ⇸ B#L) × (A#R ⇻ B#R)


      def id[A <: ⊤] = (c.id[A#L]) × (d.id[A#R])

      def compose[A <: ⊤, B <: ⊤, C <: ⊤] = (m1: A → B, m2: B → C) => {
        c.compose(m1.l, m2.l) × d.compose(m1.r, m2.r)
      }

    }
</pre>

The `Infix_product_boiler` is just some scala plumbing to give us an infix $\times$ operator and the $l \in L$ and $r \in R$ members of our pair.

<pre class="brush: scala">
    trait Infix_product_boiler {
      class ×[+T1, +T2](val l: T1, val r: T2) extends Tuple2(l, r) {
        type L = T1
        type R = T2
      }
      class Infix_×[T1](v1: T1) { def ×[T2](v2: T2) = new ×(v1, v2) }
      implicit def infix_×[T](v: T) = new Infix_×(v)
    }
</pre>


Armed with this category product we can now define $\otimes$.






<hr>
*TODO*



However, this definition wasn't enough for category theorists. To generalize this even more we will define monoids in terms of monoidal categories.

We embed the operation into a category as a morphism $M \times M \rightarrow M$


Now just to expand our minds a bit we consider this monoid $(\mathbb{Z}\rightarrow\mathbb{Z},\circ,x \mapsto x)$. That is, the monoid of composing unary integer functions where the identity is just a function that returns the input untouched. It's interesting here just to introduce the concept of higher order composition as such, particularly how it can have some interesting properties.

To be extra clever note that $(\mathbb{Z},+,0)$ becomes $(x \mapsto \mathit{n} + x ,\circ,x \mapsto x)$ if we partially apply $+$ once with every member of the set $\mathbb{Z}$ and use compose as the operator.

The structure is preserved in the transformations allowing us to perform arithmetic in either monoid. $(i \mapsto 1+i) \circ (i \mapsto 2+i) = (i \mapsto 1+2+i) = (i \mapsto 3+i)$

A structure preserving transformation such as this is called a functor, which will be the topic to cover next.

Functors
--------

A functor is defined as a mapping from a category to another preserving identities and compositions. An endofunctor is a functor from a category to itself. To skip the category theory lesson and jump straight into programming lets just say that functors translate functions on one set of types into function on another set of types in a manner that makes it irrelevant whether we compose those functions before or after mapping them.

Given a functor $F$ and functions $f$ and $g$ we can trust that $$F(g \circ f) = F(g) \circ F(f) $$

If we take only one type and functions on that type we get a composition monoid like the one for integer addition above. Functors between such monoids will have the form $$ F \in (a \rightarrow a) \rightarrow (b \rightarrow b) $$ Coupled with the fact that we can define a generic functor between any monoid and a composition monoid this functor is valid for any monoid.

Lets see if we can define this in Scala
<pre class="brush: scala">
    trait MonoidFunctor[A,B,M[_]<:Monoid,N[_]<:Monoid] {
      def map[A,B](m: M[_]): N[_]
    }
    type Src[A] = (A,A) => A
    type Dst[A] = A => A

    trait MonoidFunctor

    def toMonoid[A](f: A => A) {
    }
    def fromMonoid[A](implicit m: Monoid): A => A =


    def binToUn[A](op: (A,A) => A)(implicit m: Monoid[A]): A => A
      = op(m.id,_)

    def unToBin[T]()

</pre>


Another set of particularly interesting functors are those mapping functions into a context of some kind. $$ F \in (a \rightarrow b) \rightarrow (C(a) \rightarrow C(b)) $$

<pre class="brush: scala">
    trait Functor[C[_]] {
      def map[A,B](f: A => B): C[A] => C[B]
    }
</pre>

An example would be the Option functor.

<pre class="brush: scala">
    object OptionFunctor extends Functor[Option] {
      def map[A,B](f: A => B) = {
        case Some(v) => Some(f(v))
        case None    => None
      }
    }
</pre>


Natural Transformations
-----------------------

Before we can compose a monoid that is a monad there is the concept of natural transformations



The Monad Monoid
----------------

A monad then is an operation that combines

Contexts
--------

By context I meant information about the surroundings of an object. Where monads come into play is where we want to do operations on this context, as opposed to the things inside it. The trick is to be able to do these operations without disturbing the interior. Now this all sounds like abstract nonsense, so lets try some examples.

A typical context is when a value is contained in some data structure. The context defines the shape of the structure and the positions of all the values inside. For example we can think of


Typical Monads
--------------

The IO transformation $a \rightarrow (\text{RealWorld} \rightarrow (\text{RealWorld}, b))$

IO Monad $(a \rightarrow IO\[b\], )

List monad
  List\[\_\]
  (a → List\[b\],b → List\[c\]) → (a → List\[c\])
  List(\_)

State monad


