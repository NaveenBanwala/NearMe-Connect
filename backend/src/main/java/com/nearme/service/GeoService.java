package com.nearme.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.extern.slf4j.Slf4j;
import org.locationtech.jts.geom.*;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

/**
 * GeoService — geometry helpers using JTS (bundled with hibernate-spatial).
 *
 * NOTE: We do NOT use org.locationtech.jts.io.geojson.GeoJsonReader/Writer
 * because those classes are in a separate artifact (jts-io-common) not
 * included by hibernate-spatial. Instead we parse GeoJSON manually with
 * Jackson (already on the classpath via spring-boot-starter-web).
 */
@Slf4j
@Service
public class GeoService {

    private static final GeometryFactory FACTORY =
        new GeometryFactory(new PrecisionModel(), 4326);

    private final ObjectMapper mapper = new ObjectMapper();

    // ── Create a Point from lat/lng ──────────────────────────────────────
    public Point makePoint(double lat, double lng) {
        // JTS convention: x = longitude, y = latitude
        Point point = FACTORY.createPoint(new Coordinate(lng, lat));
        point.setSRID(4326);
        return point;
    }

    // ── Parse a GeoJSON Polygon string into a JTS Polygon ───────────────
    // Accepts either a full GeoJSON feature or just the geometry object:
    //   { "type": "Polygon", "coordinates": [[[lng,lat], ...]] }
    public Polygon parseGeoJsonPolygon(String geoJson) {
        try {
            JsonNode root = mapper.readTree(geoJson);

            // Unwrap FeatureCollection / Feature if needed
            JsonNode geometry = root;
            if ("Feature".equals(root.path("type").asText())) {
                geometry = root.path("geometry");
            }

            String type = geometry.path("type").asText();
            if (!"Polygon".equals(type)) {
                throw new IllegalArgumentException(
                    "Expected GeoJSON type Polygon but got: " + type);
            }

            // coordinates[0] is the outer ring
            JsonNode ring = geometry.path("coordinates").get(0);
            Coordinate[] coords = new Coordinate[ring.size()];
            for (int i = 0; i < ring.size(); i++) {
                JsonNode pt = ring.get(i);
                double lng = pt.get(0).asDouble();
                double lat = pt.get(1).asDouble();
                coords[i] = new Coordinate(lng, lat);
            }

            Polygon polygon = FACTORY.createPolygon(coords);
            polygon.setSRID(4326);
            return polygon;

        } catch (IllegalArgumentException e) {
            throw e;
        } catch (Exception e) {
            throw new IllegalArgumentException(
                "Invalid GeoJSON polygon: " + e.getMessage(), e);
        }
    }

    // ── Serialize a JTS Polygon to a GeoJSON string ──────────────────────
    public String toGeoJson(Polygon polygon) {
        if (polygon == null) return null;
        try {
            Coordinate[] coords = polygon.getExteriorRing().getCoordinates();
            StringBuilder sb = new StringBuilder();
            sb.append("{\"type\":\"Polygon\",\"coordinates\":[[");
            for (int i = 0; i < coords.length; i++) {
                if (i > 0) sb.append(",");
                sb.append("[").append(coords[i].x)
                  .append(",").append(coords[i].y).append("]");
            }
            sb.append("]]}");
            return sb.toString();
        } catch (Exception e) {
            log.warn("Failed to convert polygon to GeoJSON: {}", e.getMessage());
            return null;
        }
    }

    // ── Haversine distance in metres ─────────────────────────────────────
    public double distanceMeters(double lat1, double lng1,
                                 double lat2, double lng2) {
        final double R = 6_371_000;
        double dLat = Math.toRadians(lat2 - lat1);
        double dLng = Math.toRadians(lng2 - lng1);
        double a = Math.sin(dLat / 2) * Math.sin(dLat / 2)
                 + Math.cos(Math.toRadians(lat1))
                 * Math.cos(Math.toRadians(lat2))
                 * Math.sin(dLng / 2) * Math.sin(dLng / 2);
        return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    }
}