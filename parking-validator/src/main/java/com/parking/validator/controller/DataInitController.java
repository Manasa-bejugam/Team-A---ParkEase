package com.parking.validator.controller;

import com.parking.validator.model.Slot;
import com.parking.validator.repository.SlotRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/admin")
public class DataInitController {

        @Autowired
        private SlotRepository slotRepository;

        @PostMapping("/init-sample-data")
        public ResponseEntity<Map<String, Object>> initializeSampleData(
                        @RequestParam(defaultValue = "false") boolean force) {
                // Check if slots already exist
                long count = slotRepository.count();
                if (count > 0 && !force) {
                        Map<String, Object> response = new HashMap<>();
                        response.put("message",
                                        "Database already has " + count + " slots. Use ?force=true to overwrite.");
                        response.put("existingCount", count);
                        return ResponseEntity.ok(response);
                }

                if (force) {
                        slotRepository.deleteAll();
                }

                List<Slot> sampleSlots = new ArrayList<>();

                // Hyderabad - Madhapur - IKEA Mall
                sampleSlots.addAll(createSlots("A", 1, 10, "Hyderabad", "Madhapur", "IKEA Mall", "Shopping Mall",
                                17.4326, 78.3808, 100.0, 100.0));

                // Hyderabad - Madhapur - Inorbit Mall
                sampleSlots.addAll(createSlots("B", 1, 8, "Hyderabad", "Madhapur", "Inorbit Mall", "Shopping Mall",
                                17.4352, 78.3866, 200.0, 100.0));

                // Hyderabad - Gachibowli - DLF Cyber City
                sampleSlots.addAll(
                                createSlots("C", 1, 12, "Hyderabad", "Gachibowli", "DLF Cyber City", "Office Complex",
                                                17.4239, 78.3733, 300.0, 100.0));

                // Hyderabad - Hitech City - Mindspace
                sampleSlots.addAll(createSlots("D", 1, 15, "Hyderabad", "Hitech City", "Mindspace IT Park",
                                "Office Complex",
                                17.4435, 78.3772, 400.0, 100.0));

                // Bangalore - Koramangala - Forum Mall
                sampleSlots.addAll(createSlots("E", 1, 10, "Bangalore", "Koramangala", "Forum Mall", "Shopping Mall",
                                12.9352, 77.6245, 100.0, 200.0));

                // Bangalore - Whitefield - Phoenix Marketcity
                sampleSlots.addAll(createSlots("F", 1, 12, "Bangalore", "Whitefield", "Phoenix Marketcity",
                                "Shopping Mall",
                                12.9975, 77.6969, 200.0, 200.0));

                // Mumbai - Andheri - Infinity Mall
                sampleSlots.addAll(createSlots("G", 1, 8, "Mumbai", "Andheri", "Infinity Mall", "Shopping Mall",
                                19.1136, 72.8697, 100.0, 300.0));

                // Mumbai - BKC - Jio World Drive
                sampleSlots.addAll(createSlots("H", 1, 10, "Mumbai", "BKC", "Jio World Drive", "Shopping Mall",
                                19.0653, 72.8687, 200.0, 300.0));

                // Save all slots
                slotRepository.saveAll(sampleSlots);

                Map<String, Object> response = new HashMap<>();
                response.put("message", "Successfully initialized parking slots!");
                response.put("totalSlots", sampleSlots.size());
                response.put("cities", List.of("Hyderabad", "Bangalore", "Mumbai"));
                response.put("locations", 8);

                return ResponseEntity.ok(response);
        }

        private List<Slot> createSlots(String prefix, int start, int count, String city, String area,
                        String address, String placeType, double baseLat, double baseLng,
                        double baseX, double baseY) {
                List<Slot> slots = new ArrayList<>();

                for (int i = start; i < start + count; i++) {
                        Slot slot = Slot.builder()
                                        .slotNumber(prefix + i)
                                        .isAvailable(true) // Make ALL slots available as requested
                                        .city(city)
                                        .area(area)
                                        .address(address)
                                        .placeType(placeType)
                                        .latitude(baseLat + (i * 0.0001))
                                        .longitude(baseLng + (i * 0.0001))
                                        .location(new Slot.Location(baseX + (i * 50.0), baseY + (i * 50.0)))
                                        .section("General")
                                        .build();

                        slots.add(slot);
                }

                return slots;
        }
}
