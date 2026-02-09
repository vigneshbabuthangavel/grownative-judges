"use server";

import { cookies } from "next/headers";
import { getAdminConfig, saveAdminConfig } from "@/lib/adminStorage";
import crypto from 'crypto';

const SUPER_COOKIE_NAME = "gn_super_admin_token";
const PARENT_COOKIE_PREFIX = "gn_parent_token_";

function hashPassword(password: string) {
    return crypto.createHash('sha256').update(password).digest('hex');
}

// Check if admin is set up
export async function checkIsSetup() {
    const config = await getAdminConfig();
    return !!config.passwordHash;
}

// Register (First Run)
export async function registerAdmin(password: string) {
    const config = await getAdminConfig();
    if (config.passwordHash) {
        return { success: false, error: "Admin already configured." };
    }

    if (!password || password.length < 5) {
        return { success: false, error: "Password too short." };
    }

    const hash = hashPassword(password);
    await saveAdminConfig(hash);

    // Auto-login
    await setAdminCookie();
    return { success: true };
}

// Login
export async function loginSuperAdmin(password: string) {
    const config = await getAdminConfig();

    if (!config.passwordHash) {
        return { success: false, error: "System not set up yet." };
    }

    const hash = hashPassword(password.trim());
    if (hash === config.passwordHash) {
        await setAdminCookie();
        return { success: true };
    }
    return { success: false, error: "Incorrect Password" };
}

async function setAdminCookie() {
    const cookieStore = await cookies();
    cookieStore.set(SUPER_COOKIE_NAME, "valid", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        maxAge: 60 * 60 * 24, // 1 day
        path: "/",
    });
}

export async function checkSuperAdminSession() {
    const cookieStore = await cookies();
    return cookieStore.has(SUPER_COOKIE_NAME);
}

// Parent PIN Verification (Server-Side Hash Check is ideal, but for now we keep hash logic consistent with client)
// Ideally, we'd pass the profileId and verify against DB.
// Since profile storage is client-side (localstorage), we can't fully "secure" parent gate without moving profile DB to server.
// COMPROMISE: We will set a cookie to "remember" the session securely, but the initial check relies on the client passing the hash.
// This is still better than pure localstorage because the 'session' state is HttpOnly.
export async function setParentSession(profileId: string) {
    const cookieStore = await cookies();
    cookieStore.set(PARENT_COOKIE_PREFIX + profileId, "valid", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        maxAge: 60 * 60 * 24 * 7, // 1 week
        path: "/",
    });
    return { success: true };
}

export async function checkParentSession(profileId: string) {
    const cookieStore = await cookies();
    return cookieStore.has(PARENT_COOKIE_PREFIX + profileId);
}

export async function logoutSuperAdmin() {
    const cookieStore = await cookies();
    cookieStore.delete(SUPER_COOKIE_NAME);
}

export async function logoutParent(profileId: string) {
    const cookieStore = await cookies();
    cookieStore.delete(PARENT_COOKIE_PREFIX + profileId);
}
