package com.nearme.exception;

import java.util.UUID;

public class BlockNotFoundException extends RuntimeException {
    public BlockNotFoundException(UUID blockId) {
        super("Block not found: " + blockId);
    }
    public BlockNotFoundException(String message) {
        super(message);
    }
}