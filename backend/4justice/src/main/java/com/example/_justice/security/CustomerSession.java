package com.example._justice.security;

import jakarta.servlet.http.HttpSession;

public final class CustomerSession {

    public static final String CUSTOMER_ID = "customerId";

    private CustomerSession() {
    }

    public static Long getCustomerId(HttpSession session) {
        if (session == null) {
            return null;
        }

        Object customerId = session.getAttribute(CUSTOMER_ID);
        if (customerId instanceof Long id) {
            return id;
        }
        if (customerId instanceof Number id) {
            return id.longValue();
        }
        if (customerId instanceof String id) {
            try {
                return Long.valueOf(id);
            } catch (NumberFormatException ignored) {
                return null;
            }
        }
        return null;
    }
}
