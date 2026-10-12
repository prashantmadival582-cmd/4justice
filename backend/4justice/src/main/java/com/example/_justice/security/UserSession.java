package com.example._justice.security;

import jakarta.servlet.http.HttpSession;

public final class UserSession {

    public static final String ROLE = "userRole";
    public static final String LAWYER_ID = "lawyerId";
    public static final String ADMIN = "ADMIN";
    public static final String LAWYER = "LAWYER";

    private UserSession() {
    }

    public static void start(HttpSession session, String role) {
        session.setAttribute(ROLE, role);
    }

    public static String getRole(HttpSession session) {
        Object role = session == null ? null : session.getAttribute(ROLE);
        return role instanceof String value ? value : null;
    }

    public static Long getLawyerId(HttpSession session) {
        Object lawyerId = session == null ? null : session.getAttribute(LAWYER_ID);
        if (lawyerId instanceof Long id) {
            return id;
        }
        if (lawyerId instanceof Number id) {
            return id.longValue();
        }
        return null;
    }
    
}
