---
layout: post
title: "[Java] equals() 와 hashCode() 메소드에 대한 고찰"
categories: Java
---

모르고 넘어갈 수 있는 자바의 equals() 와 hashCode() 메소드에 대해서 짚고 넘어가는 글을 작성해 봅니다.

## equals()

자바의 최상위 클래스인 Object 클래스의 equals() 메소드를 살펴보면 아래와 같이 객체의 주소를 비교합니다.

~~~java
public boolean equals(Object obj) {
    return (this == obj);
}
~~~

주소 값을 비교하는 "==" 연산자를 사용하여 비교하고 있습니다.

하지만 String 클래스 객체의 값을 서로 비교하면 보통 주소가 아니라 값이 같으면 true 를 반환하고 있습니다.  
이는 equals() 메소드를 오버라이딩해서 사용하고 있기 때문입니다.

#### String 클래스의 equals()

~~~java
public boolean equals(Object anObject) {
    if (this == anObject) {
        return true;
    }
    return (anObject instanceof String aString)
            && (!COMPACT_STRINGS || this.coder == aString.coder)
            && StringLatin1.equals(value, aString.value); // 여기서 값을 비교
}
~~~

이와 같이 내부 값이 동일한 경우 오버라이딩 하여 자주 사용하는 메소드 입니다.

하지만, Hash 를 사용하는 Collection 에서 이러한 객체를 다루게 되면 문제가 됩니다.  
예를 들어 두 개의 동물(호랑이)을 의미하는 객체를 생성한 후 equals() 를 오버라이딩 한 후, 이를 중복을 허용하지 않는 Collection 인 HashSet 에 추가해 보겠습니다.

~~~java
public class Animal {
    Animal(String name) {
        this.name = name;
    }
    private String name;

    // IDE 의 Generate 기능 사용하여 정의
    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        Animal animal = (Animal) o;
        return name.equals(animal.name);
    }
}

public class Main {
    public static void main() {
        Animal animal1 = new Animal("Tiger");
        Animal animal2 = new Animal("Tiger");

        Set<Animal> animalSet = new HashSet<>();
        animalSet.add(animal1);
        animalSet.add(animal2);

        System.out.println(animalSet.size());
    }
}
~~~

결과 

~~~
2
~~~

equals() 를 재정의하여 값이 같은 경우 true 를 반환하도록 정의했지만, HashSet 내부에서는 이를 동일한 객체로 취급하지 않아 2개의 아이템이 추가된 것을 확인할 수 있습니다.

이를 해결하려면 아래 코드와 같이 hashCode() 를 함께 오버라이딩하여 필드값을 기반으로 hash 값을 반환해주면 해결할 수 있습니다.

~~~java
public class Animal {
    Animal(String name) {
        this.name = name;
    }
    private String name;

    // IDE 의 Generate 기능 사용하여 정의
    @Override 
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        Animal animal = (Animal) o;
        return name.equals(animal.name);
    }

    @Override
    public int hashCode() {
        // name 필드를 기반으로 Objects 클래스의 hash() static 메소드를 사용하여 hash 값을 생성하여 반환한다.
        return Objects.hash(name); 
    }
}

public class Main {
    public static void main() {
        Animal animal1 = new Animal("Tiger");
        Animal animal2 = new Animal("Tiger");

        Set<Animal> animalSet = new HashSet<>();
        animalSet.add(animal1);
        animalSet.add(animal2);

        System.out.println(animalSet.size());
    }
}
~~~

결과 

~~~
1
~~~

여기까지 살펴보면 Animal 클래스의 equals() 와 hashCode() 메소드를 모두 오버라이딩 해야 문제없이 사용할 수 있는 것을 알 수 있습니다.  
이러한 이유는, Hash 기반의 Collection 에서는 **hashCode() 반환값이 우선 일치하고, equals() 반환값도 true** 여야 비로소 동등한 객체로 취급하기 때문입니다.

그렇다면, 아래에서 hashCode() 메소드에 대해 좀 더 다뤄보겠습니다.

## hashCode()

각각의 객체를 구별하기 위해 사용되며, 객체의 메모리 주소를 해싱 알고리즘을 사용한 32비트 정수로 변환한 값을 반환합니다.
직접 메모리 주소를 반환하지 않는 이유는, 메모리를 직접 다루지 못하게 하여 안정성을 추구하는 자바의 컨셉 때문이라고 여겨집니다.
이 값은 대체로 고유하지만, 특정 케이스에서는 중복될 수 있는 여지가 있습니다. (이 부분은 여기서는 다루지 않겠습니다.)

~~~java
public class Animal {
    Animal(String name) {
        this.name = name;
    }
    private String name;
}

public class Main {
    public static void main() {
        Animal animal1 = new Animal("Tiger");
        Animal animal2 = new Animal("Tiger");

        System.out.println(animal1.hashCode());
        System.out.println(animal2.hashCode());
    }
}
~~~

결과

~~~
1804094807
951007336
~~~

위 결과와 같이 같은 필드 값을 가지고 있는 두 객체의 hashCode 값은 서로 다름을 알 수 있습니다.
앞서 equals() 메소드 부분에서 다룬 것 처럼 서로 다른 객체를 동등하게 취급하고 싶다면 hashCode() 를 오버라이딩 하여 주소 기반이 아닌 값을 기반으로 hash 값을 생성해야 함을 반드시 명심해야 합니다.





