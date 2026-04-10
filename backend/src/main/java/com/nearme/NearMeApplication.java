// package com.nearme;

// import org.springframework.boot.SpringApplication;
// import org.springframework.boot.autoconfigure.SpringBootApplication;

// @SpringBootApplication
// public class BackendApplication {

// 	public static void main(String[] args) {
// 		SpringApplication.run(BackendApplication.class, args);
// 	}

// }
package com.nearme;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class NearMeApplication {
    public static void main(String[] args) {
        SpringApplication.run(NearMeApplication.class, args);
    }
}