---
layout: post
title: "[Kotlin] Delegation 사용설명서"
categories: Kotlin
---

코틀린에서는 Delegation 디자인 패턴을 언어 수준에서 지원하는 기능을 가지고 있습니다.  
이에 관하여 자세히 알아보고 사용법을 살펴보도록 하겠습니다.

## Delegation

앞서 언급한 Delegation Pattern(위임 패턴) 에 대해서 간단하게 짚고 넘어갈 필요가 있습니다.
위임 패턴은 클래스를 상속받지 않고, 다른 클래스의 재사용할 수 있도록 해주는 디자인 패턴 중에 하나 입니다.

우선 소프트웨어 공학에서 다른 클래스 기능의 재사용을 위해 사용하는 두 가지 방법은 다음과 같습니다.

- 상속(Inheritance)
- 포함(Composition)

상속은 상위 클래스의 기능을 하위 클래스에 가져와 사용할 수 있지만, 상위 클래스에 의존적이게 되고 캡슐화를 무너뜨리는 단점이 있습니다.  
하지만 포함은 다른 클래스의 객체를 내 클래스에 **포함**하여 다른 클래스의 기능을 그대로 가져올 수 있으며, 상위 클래스에 의존하지 않아도 캡슐화를 유지할 수 있는 장점이 있습니다.  
>Composition 이란 단어는 '포함'을 비롯해 '구성', '조합' 등의 단어로 번역할 수 있지만, 본문에서는 '포함'이라는 단어를 사용하도록 하겠습니다.

그렇다고 포함이 무조건 옳은 것은 아니며 사용 사례에 따라 적절히 선택하여 사용해야 할 것 입니다.  

### 상속과 포함은 어떤 상황에서 선택하면 좋을까?

- 상속을 고려해야 하는 경우  
  - 상위 클래스와 하위 클래스의 관계가 **is-a** 관계일 때
  - 예) 개발자(하위클래스)는 사람(상위클래스)이다.
- 포함을 고려해야하는 경우  
  - 상위 클래스가 하위 클래스를 포함 **has-a** 하는 관계일 때 
  - 예) 개발자(상위클래스)는 키보드(하위클래스)를 가지고 있다.

포함을 사용해야 하는 상황이라면 코틀린의 위임을 이용하여, 상용구 코드 없이 단순하게 구현할 수 있습니다.  
다음은 Delegation 을 구현하는 코틀린 코드의 일반적인 예제입니다.

~~~kotlin
interface Base {
    fun print()
}

class Example(val x: Int) : Base {
    override fun print() {
        println(x)
    }
}

class MyDelegate(b: Base) : Base by b // by 예약어를 사용하여 print() 메소드를 직접 구현하지 않고 b 객체의 이미 구현된 메소드를 사용할 수 있습니다.

fun main() {
    val e = Example(12)
    MyDelegate(e).print()
}
~~~

## Delegated properites

메소드 뿐만 아니라 프로퍼티 차원에서도 Delegation 을 지원하는 기능이 있습니다.  
일단 예제코드를 보겠습니다.

~~~kotlin
class Delegate {
    operator fun getValue(thisRef: Any?, property: KProperty<*>): String {
        return "Hello, getValue()"
    }

    operator fun setValue(thisRef: Any?, property: KProperty<*>, value: String) {
        println(value)
    }
}

class Example {
    var delegatedProperty: String by Delegate() // by 키워드를 통해 String 의 Read, Write 기능을 Delegate 클래스에 위임
}

fun main() {
    val e = Example()
    e.delegatedProperty = "Hello, setValue()"
    println(e.delegatedProperty)
}
~~~

핵심은 **by** 키워드 입니다.  
Example 클래스 내에 String 타입의 프로퍼티를 선언하고 by 키워드를 통해 프로퍼티에 대한 기능을 Delegate 클래스에 위임하였습니다.
Delegate 클래스를 살펴보면 getValue(), setValue() 메소드가 **operator** 키워드를 통해 연산자 오버로딩 되어 있는 것을 확인할 수 있습니다.  
여기서 눈치챌 수 있는 건, Delegate 클래스에서 String 클래스의 읽기와 쓰기 기능을 새로 구현하겠다는 것을 알 수 있습니다.

코드를 실행해보면 delegatedProperty 에 값을 할당하는 경우 Delegate 클래스의 setValue() 메소드가 호출되고, 값을 읽어들이면 getValue() 메소드가 호출되는 것을 확인할 수 있습니다.

**결과**

~~~
Hello, setValue()
Hello, getValue()
~~~

## Stardard delegates

코틀린 표준 라이브러리에서 제공하는 Delegation 기능 집합을 소개합니다.

### Lazy

lazy() 메소드를 사용하여 프로퍼티의 초기화를 위임할 수 있으며, 프로퍼티의 최초 참조 시 람다식에 구현된 코드를 실행하여 결과 값을 기억한 뒤 추후 참조 시에는 기억된 값만 가져오는 식으로 동작합니다.  
lazy() 메소드는 프로퍼티의 초기화를 최초 참조하는 시점으로 지연시켜 효율적인 메모리 사용을 도와줍니다.

~~~kotlin
val lazyValue: String by lazy {
    println("computed!")
    "Hello"
}

fun main() {
    println(lazyValue)
    println(lazyValue)
}
~~~

**결과**
~~~
computed!       // 최초 참조의 결과 값
Hello           // 최초 참조의 결과 값
Hello           // 두 번째 참조의 결과 값
~~~

lazy() 메소드는 Lazy<> 인터페이스를 구현한 클래스의 객체를 반환하고 있는데, **Lazy<> 인터페이스**에 대해서 알아보겠습니다.

안드로이드 개발에서 우리는 Fragment 내부 특정 프로퍼티에 ViewModel 초기화를 위한 아래와 같은 코드를 많이 접해보았을 것입니다.

~~~kotlin
private val viewModel: MyViewModel by viewModels()
~~~

Fragment ktx를 사용하면 `viewModels()` 확장 함수를 사용하여 지연 초기화의 목적을 달성할 수 있습니다.  
`viewModels()` 의 내부 구현은 어떠한 지 살펴보도록 하겠습니다.

~~~kotlin
@MainThread
public inline fun <reified VM : ViewModel> Fragment.viewModels(
    noinline ownerProducer: () -> ViewModelStoreOwner = { this },
    noinline extrasProducer: (() -> CreationExtras)? = null,
    noinline factoryProducer: (() -> Factory)? = null
): Lazy<VM> {
    val owner by lazy(LazyThreadSafetyMode.NONE) { ownerProducer() }
    return createViewModelLazy(
        VM::class,
        { owner.viewModelStore },
        {
            extrasProducer?.invoke()
            ?: (owner as? HasDefaultViewModelProviderFactory)?.defaultViewModelCreationExtras
            ?: CreationExtras.Empty
        },
        factoryProducer ?: {
            (owner as? HasDefaultViewModelProviderFactory)?.defaultViewModelProviderFactory
                ?: defaultViewModelProviderFactory
        })
}
~~~

최종적으로 createViewModelLazy() 를 호출하고 있음을 확인할 수 있습니다.  
createViewModelLazy() 메소드의 구현을 들어가 봅니다.

~~~kotlin
@MainThread
public fun <VM : ViewModel> Fragment.createViewModelLazy(
    viewModelClass: KClass<VM>,
    storeProducer: () -> ViewModelStore,
    extrasProducer: () -> CreationExtras = { defaultViewModelCreationExtras },
    factoryProducer: (() -> Factory)? = null

): Lazy<VM> {
    val factoryPromise = factoryProducer ?: {
        defaultViewModelProviderFactory
    }
    return ViewModelLazy(viewModelClass, storeProducer, factoryPromise, extrasProducer)
}
~~~

단순히 Lazy<> 인터페이스를 구현한 ViewModelLazy 클래스의 객체를 최종 반환해주는 것을 확인할 수 있습니다.  
여기까지 보았을 때, 지연 초기화의 목적을 달성하기엔 힘들어 보입니다.  
그렇다면 ViewModelLazy 구현도 살펴봅니다.

~~~kotlin
public class ViewModelLazy<VM : ViewModel> @JvmOverloads constructor(
    private val viewModelClass: KClass<VM>,
    private val storeProducer: () -> ViewModelStore,
    private val factoryProducer: () -> ViewModelProvider.Factory,
    private val extrasProducer: () -> CreationExtras = { CreationExtras.Empty }
) : Lazy<VM> {
    private var cached: VM? = null

    override val value: VM
        get() { 
            val viewModel = cached
            return if (viewModel == null) { 
                // 최초 참조 시 ViewModelProvider 를 통해 인스턴스 생성 후 캐시
                val factory = factoryProducer()
                val store = storeProducer()
                ViewModelProvider(
                    store,
                    factory,
                    extrasProducer()
                ).get(viewModelClass.java).also {
                    cached = it
                }
            } else {
                // 두 번째 참조부터 캐시된 객체 반환
                viewModel
            }
        }

    override fun isInitialized(): Boolean = cached != null
}
~~~

`value` 의 getter 를 호출하면 `ViewModelProvider` 를 통하여 `ViewModel` 의 인스턴스를 제공받고, `cached` 프로퍼티에 캐시하고 있음을 알 수 있습니다.  
싱글톤 패턴의 그것과 비슷하게 구성되어 있으며, `Lazy<>` 인터페이스를 상속하여 초기화 동작을 직접 구현하는 방식입니다.

앞서 설명한 `lazy()` 메소드도 구현부를 보면 `Lazy<>` 인터페이스를 상속한 `SynchronizedLazyImpl` 객체를 반환하는 방식으로 비슷하게 초기화를 구현하고 있습니다.  
내부에는 멀티스레딩 환경에 대응할 수 있도록, `synchronized` 키워드를 사용한 다소 긴 코드를 구현하고 있습니다.

결론은 이와 같은 패턴으로 객체 초기화에 대한 상용구 코드를 줄일 수 있으며, 복잡한 초기화 동작을 특정 클래스(`ViewModelLazy`, `SynchronizedLazyImpl` 등)에게 위임할 수 있는 멋진 설계라 할 수 있습니다.

### Observable

`Delegates.observable()` 메소드를 사용하면, 프로퍼티에 할당이 발생할 때 핸들러를 호출하도록 구현할 수 있습니다.  
Jetpack 의 LiveData 와 비슷한 동작을 합니다.
초기값을 할당할 수 있으며, 핸들러 내부에서 `old`, `new` 파라미터를 넘겨받아 원하는 동작을 수행할 수 있습니다.

~~~kotlin
class User {
    var name: String by Delegates.observable("first") {
        prop, old, new ->
        println("$old -> $new")
    }
}

fun main() {
    val user = User()
    user.name = "second"
    user.name = "third"
}
~~~

**결과**

~~~
first -> second
second -> third
~~~

### Vetoable

`observable()` 과 비슷한 `vetoable()` 메소드를 사용하면 핸들러에서 반환되는 `Boolean` 값을 기준으로 값이 할당되었을 때, 저장할 것인지 말지를 결정할 수 있습니다.

~~~kotlin
var max: Int by Delegates.vetoable(0) { property, oldValue, newValue ->
    newValue > oldValue // 새로운 값이 더 클 경우에만 값을 할당
}

println(max) // 0

max = 10     // 새로운 값이 더 커서 조건을 만족함으로 10은 정상적으로 할당됨
println(max) // 10

max = 5      // 새로운 값이 더 작아서 조건을 불만족함으로 5는 할당되지 않고 이전 값 10을 유지함
println(max) // 10
~~~

### Storing properties in a map

프로퍼티 값을 맵에 저장하는 기능입니다.
일반적인 사용 사례로 파싱된 JSON 데이터를 가공하기에 적절할 것 입니다.

~~~kotlin
class User(map: Map<String, Any?>) {
    val name: String by map
    val age: Int by map
}

fun main() {
    val user = User(
        mapOf(
            "name" to "Mickey",
            "age" to 95
        )
    )

    println(user.name) // Mickey
    println(user.age)  // 95
}
~~~

위임된 프로퍼티에서 값을 읽으면 map 에서 값을 가져오게 됩니다.

가변 프로퍼티에 위임하고 싶다면 프로퍼티를 가변으로 설정 후 `MutableMap` 으로 선언하여 사용하면 가능합니다.

~~~kotlin
class User(map: MutableMap<String, Any?>) {
    var name: String by map
    var age: Int by map
}

fun main() {
    val user = User(
        mutableMapOf(
            "name" to "Mickey",
            "age" to 95
        )
    )
    ...
}
~~~