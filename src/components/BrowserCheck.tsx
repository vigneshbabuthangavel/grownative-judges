"use client";

import * as React from "react";
import { Alert, Box, IconButton, Collapse } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import InfoIcon from "@mui/icons-material/Info";

export function BrowserCheck() {
    const [open, setOpen] = React.useState(true);
    const [isChrome, setIsChrome] = React.useState(true);

    React.useEffect(() => {
        // Basic detection for Chrome/Chromium
        const agent = window.navigator.userAgent.toLowerCase();
        const isChromium = agent.indexOf("chrome") > -1 && !!(window as any).chrome;
        const isEdge = agent.indexOf("edg") > -1;
        const isOpera = agent.indexOf("opr") > -1;

        // We specifically want to warn Safari/Firefox users about Audio Sync
        // So if it's NOT Chromium (or is effectively Edge/Opera which are Chromium), we warn.
        // Simplifying: Just define "Safe" as Chrome-ish.
        const safe = isChromium || isEdge || isOpera;

        setIsChrome(safe);
    }, []);

    if (isChrome) return null;

    return (
        <Box sx={{ width: '100%', position: 'relative', zIndex: 9999 }}>
            <Collapse in={open}>
                <Alert
                    severity="warning"
                    icon={<InfoIcon fontSize="inherit" />}
                    action={
                        <IconButton
                            aria-label="close"
                            color="inherit"
                            size="small"
                            onClick={() => {
                                setOpen(false);
                            }}
                        >
                            <CloseIcon fontSize="inherit" />
                        </IconButton>
                    }
                    sx={{ borderRadius: 0 }}
                >
                    <strong>Audio Experience Warning:</strong> For the best "Live Director" audio synchronization, we strongly recommend using <strong>Google Chrome</strong>. Safari and Firefox may block auto-play.
                </Alert>
            </Collapse>
        </Box>
    );
}
