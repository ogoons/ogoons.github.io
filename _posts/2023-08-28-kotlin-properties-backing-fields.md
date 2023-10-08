---
layout: post
title: "[Kotlin] Properties 와 Backing Fields 에 대하여"
categories: Kotlin
---

코틀린의 Properties 와 Backing Fields 에 대해서 알아보고, 추가로 자바와의 차이점과 Backing Properties 에 대해서도 다뤄봅니다.

## Kotlin 의 Property

살펴보기 앞서, Property 는 Field 와 접근자인 Getter, Setter 를 모두 묶어서 부르는 개념이라 할 수 있습니다.  
프로퍼티 개념이 생긴 이유는 클래스의 가장 큰 목적인 데이터 캡슐화와 연관되어 있습니다.

자바에서는 프로퍼티가 없고, 필드라는 개념만 있습니다.  
코틀린에서의 프로퍼티는 자바의 필드에 더해 기본 접근자 메소드(Getter, Setter)를 자동으로 생성해주기 때문에 이를 묶어서 Property 라고 부릅니다.  

물론 프로그래머가 원한다면 자동 생성되는 접근자 메소드 말고 아래 코드와 같이 직접 명시적으로 선언하는 것도 가능합니다.  
다만, 프로퍼티의 가변과 불변 타입에 따라서 커스텀 가능한 접근자 메소드가 달라집니다.

~~~kotlin
class Person(name: String, age: Int) {
    val name: String = name // name 프로퍼티, 불변 값이므로 Getter 만 커스텀 가능
        get() {
            // 여기서 데이터 가공 후 반환, 가공이 필요없다면 Getter 를 굳이 커스텀할 필요는 없다.
            return field
        }

    var age: Int = age // age 프로퍼티, 가변 값이므로 Getter, Setter 모두 커스텀 가능
        get() {
            // 여기서 데이터 가공 후 반환
            if (field < 0) return throw AssertionError("Must be greater than or equal to 0")
            return field
        }
        set(value) { // Assign 한 Value 의 값이 value 매개변수로 들어온다.
            // 여기서 데이터 가공 후 field 에 보관
            if (field < 0) {
                field = 0
            } else {
                field = value
            }
        }
}
~~~

원칙적으로 **프로퍼티는 상태를 나타내거나 설정하기 위한 목적**으로만 사용하는 것이 가장 좋고, 연산이나 비즈니스 로직이 들어가는 것을 권장하지 않습니다.  
그럴 일이 필요하다면, 별도의 함수로 정의하는 것이 좋습니다.

반대로 프로퍼티를 읽거나 쓰고 싶다면, 기본 접근자를 사용해야 합니다.
자바처럼 Getter, Setter 를 함수로 별도 정의해서 사용하는 것은 좋지 않습니다.

## Backing Fields

위 예제 코드를 다시 살펴보면 자바에서의 필드(멤버변수)처럼 접근 메소드 본문에서 **field** 라는 식별자는 데이터 보관을 위한 레퍼런스 임을 눈치챌 수 있습니다.  
이 필드를 **Backing Field (지원 필드)** 라고 합니다.

코틀린 클래스에서는 필드는 직접 선언할 수 없고, 프로퍼티를 선언하면 자동으로 생성되며 프로퍼티의 일부로만 사용됩니다.  
그리고 접근자 본문에서만 field 식별자를 이용하여 참조 및 조작할 수 있습니다.  

Backing Field 의 구체적인 생성 조건은 다음과 같습니다.

- 접근자(Getter, Setter) 중에 하나 이상의 기본 구현을 사용하는 경우
- 접근자(Getter, Setter) 를 재정의하여 field 식별자를 참조하는 경우

Getter 에서 field 의 조작은 금지되어 읽기만 가능하며, Setter 에서는 조작과 읽기 모두 가능합니다.

그리고 아래와 같은 경우는 Backing Field 를 생성하지 않습니다.

~~~kotlin
val isEmpty: Boolean
    get() = this.size == 0
~~~

## Backing Properties

Backing Field 를 사용하면 Getter 와 Setter 범위 내에서만 `field` 에 접근이 가능합니다.  
하지만 Backing Field 와 접근자 메소드를 사용하지 않는 사례도 있을 수 있습니다.

이러한 경우에 아래 코드와 같이 Backing Property 를 사용하여 원본 데이터를 저장하는 필드(`_age`)를 별도로 만들고 해당 필드에 직접 접근하도록 해야합니다.  
자동으로 생성되는 Backing Field 가 굳이 불필요하다면 말입니다.

~~~kotlin
class Person {
    private var _age: Int = 0
    var age: Int
        get() {
            return _age
        }
        set(value) {
            _age = value
        }
}
~~~

이러한 방식은 기본 Getter, Setter 를 사용하며 `private` 프로퍼티인 `_age` 에 대한 액세스가 최적화 되어 함수 호출에 대한 오버헤드가 발생하지 않으며, Java 와 같은 방식으로 동작하게 됩니다.

하지만!

굳이 이렇게 할 이유가 없습니다.
위 예제코드는 아래와 같은 방식으로 구현할 수 있기 때문입니다.

~~~kotlin
class Person {
    var age: Int = 0
        private set
}
~~~

더 간결해졌고, 동일하게 동작합니다.

그럼에도 불구하고 Backing Property 를 사용하는 이유는 무엇일까요?
아마도 가장 보편적인 이유로는 public 프로퍼티에서 상위 타입을 반환하기 위함일 것 입니다.

가장 좋은 예는 안드로이드 Jetpack 의 `LiveData` 를 `ViewModel` 내부에 정의하는 경우입니다.

~~~kotlin
class MyViewModel : ViewModel() {
    private var _result = MutableLiveData<String>()
    val result: LiveData<String> = _result
}
~~~

## Explicit Backing Fields

위와 같은 코드는 클래스 외부에서 이미 처리된 결과를 변경하는 것을 방지하는데 효과적입니다.  
하지만 매번 두 개의 프로퍼티를 작성해주어야 하는 번거로움이 있습니다.  
별로 우아하지도 않고요...

이 부분을 다음 버전의 코틀린에서 해결된 기능이 나왔으면 하는 바램이 있었는데, 안 그래도 꽤 오래전부터(2016년 11월 7일) 논란([KT-14663](https://youtrack.jetbrains.com/issue/KT-14663)) 이 되었던 문제인가 봅니다.

코틀린 이슈 트래커에서 해당 티켓을 살펴보면 이 문제를 해결하기 위해 Kotlin 1.7.0 부터 **Explicit Backing Fields** 라는 개념을 도입하게 되었다는 소식을 맞이할 수 있습니다.  
코드는 다음과 같습니다.

~~~kotlin
class C {
    val myList: List<String>
        field = mutableListOf<String>()
}
~~~

하지만 시험판 코드로서만 사용해볼 수 있고 안정적이지 않다고 합니다. ([레퍼런스 문서](https://github.com/Kotlin/KEEP/blob/explicit-backing-fields-re/proposals/explicit-backing-fields.md))  
게다가 막상 사용하자니 아래 경고를 띄우는 것을 보니 아직도 IDE 에서는 지원하지 않는 것 같습니다.


> Explicit backing field declarations are not supported in FE 1.0


사용해보려면 앱 수준의 gradle 파일에 [코틀린 옵션](https://gist.github.com/dellisd/a1e2ae1a7e6b61590bef4b2542a555a0)을 별도로 추가해야 합니다.  
아직도 대중적으로 사용되지는 않으며, 안정화 될때까지 기다려야 할 것 같습니다.

차후에 업데이트 되는 내용이 있다면 추후에 더 글을 작성해보기로 하면서 글을 마칩니다.

**Reference**  
https://kotlinlang.org/docs/properties.html