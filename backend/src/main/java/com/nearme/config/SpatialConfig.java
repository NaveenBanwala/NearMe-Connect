package com.nearme.config;

import org.locationtech.jts.geom.GeometryFactory;
import org.locationtech.jts.geom.PrecisionModel;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class SpatialConfig {

    @Bean
    public GeometryFactory geometryFactory() {
        // SRID 4326 is the standard for GPS (WGS84)
        return new GeometryFactory(new PrecisionModel(), 4326);
    }
}