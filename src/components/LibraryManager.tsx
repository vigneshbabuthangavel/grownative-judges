"use client";

import * as React from 'react';
import {
    Box, Typography, Paper, Button, Stack, Chip, Divider, IconButton, CircularProgress,
    List, ListItem, ListItemText, ListItemSecondaryAction, Dialog, DialogTitle,
    DialogContent, DialogContentText, DialogActions, TextField
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import RestorePageIcon from '@mui/icons-material/RestorePage';
import AutoStoriesIcon from '@mui/icons-material/AutoStories';
import Link from 'next/link';

interface LibraryManagerProps {
    onBack: () => void;
    onStoryRetracted?: () => void;
}

export default function LibraryManager({ onBack, onStoryRetracted }: LibraryManagerProps) {
    const [stories, setStories] = React.useState<any[]>([]);
    const [loading, setLoading] = React.useState(true);
    const [retractDialogOpen, setRetractDialogOpen] = React.useState(false);
    const [selectedStory, setSelectedStory] = React.useState<any>(null);
    const [revisionNote, setRevisionNote] = React.useState("");

    React.useEffect(() => {
        fetchStories();
    }, []);

    const fetchStories = async () => {
        try {
            setLoading(true);
            // Fetch all stories, backend returns them all, we filter on client or server
            // Ideally server supports query param but for now client filter is fine for demo
            const resp = await fetch('/api/stories?summary=true');
            const data = await resp.json();
            // Filter for only PUBLISHED (Active) stories. i.e. NOT requiring revision.
            const active = data.filter((s: any) => !s.community?.isRevisionRequired);
            setStories(active);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    const handleOpenRetract = (story: any) => {
        setSelectedStory(story);
        setRevisionNote("Pulled from library for review.");
        setRetractDialogOpen(true);
    };

    const handleRetract = async () => {
        if (!selectedStory) return;

        try {
            const resp = await fetch('/api/stories', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    storyId: selectedStory.storyId,
                    isRevisionRequired: true,
                    revisionNote: revisionNote
                })
            });

            if (resp.ok) {
                // Refresh list
                fetchStories();
                setRetractDialogOpen(false);
                setSelectedStory(null);
                if (onStoryRetracted) onStoryRetracted();
            } else {
                alert("Failed to retract story.");
            }
        } catch (e) {
            console.error(e);
            alert("Error retracting story.");
        }
    };

    return (
        <Paper elevation={0} sx={{ p: 5, borderRadius: 0, border: '1px solid #111', minHeight: '80vh' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 4 }}>
                <Button onClick={onBack} startIcon={<ArrowBackIcon />} sx={{ mr: 2, fontWeight: 'bold', color: 'text.secondary' }}>
                    Back
                </Button>
                <Box>
                    <Typography variant="h4" fontWeight={950}>Manage Library</Typography>
                    <Typography color="text.secondary">View active stories and manage availability.</Typography>
                </Box>
            </Box>

            {loading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
                    <CircularProgress />
                </Box>
            ) : stories.length === 0 ? (
                <Box sx={{ textAlign: 'center', py: 8, bgcolor: '#f9fafb', borderRadius: 0, border: '1px solid #eee' }}>
                    <Typography variant="h6" color="text.secondary">No active stories in the library.</Typography>
                    <Typography variant="body2" color="text.secondary">Publish some stories from the Content Factory first!</Typography>
                </Box>
            ) : (
                <List>
                    {stories.map((story) => (
                        <Paper key={story.storyId} sx={{ mb: 2, borderRadius: 0, overflow: 'hidden', border: '1px solid #eee' }} elevation={0}>
                            <ListItem sx={{ p: 3 }}>
                                <Box sx={{ display: 'flex', gap: 3, width: '100%', alignItems: 'center' }}>
                                    {/* Thumbnail */}
                                    <Box sx={{ width: 80, height: 80, bgcolor: '#f0f0f0', borderRadius: 0, overflow: 'hidden', border: '1px solid #111' }}>
                                        {(() => {
                                            // SMART THUMBNAIL RESOLUTION
                                            const getThumbnail = () => {
                                                // 1. Try explicit path
                                                let src = story.thumbnailPath || story.thumbnailSvgPath;
                                                // 2. Try first page path
                                                if (!src) src = story.pages?.[0]?.imagePath;
                                                // 3. Try fallback to base64 data (if summary didn't strip it)
                                                if (!src) src = story.pages?.[0]?.image?.data;

                                                if (!src) return null;

                                                // 4. Fix Raw Base64
                                                if (src.startsWith('/9j/') || src.startsWith('iVBOR')) {
                                                    return `data:image/jpeg;base64,${src}`;
                                                }
                                                return src;
                                            };

                                            const src = getThumbnail();

                                            if (src) {
                                                return (
                                                    <img
                                                        src={src}
                                                        alt={story.title_native || "Story Thumbnail"}
                                                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                                        onError={(e) => {
                                                            (e.target as HTMLImageElement).style.display = 'none';
                                                            (e.target as HTMLImageElement).nextElementSibling?.removeAttribute('hidden');
                                                        }}
                                                    />
                                                );
                                            }
                                            return null;
                                        })()}

                                        {/* Fallback Icon (Hidden by default, shown on error/missing) */}
                                        <Box
                                            hidden={!!(story.thumbnailPath || story.pages?.[0]?.imagePath)}
                                            sx={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ccc', bgcolor: '#eee' }}
                                        >
                                            <AutoStoriesIcon />
                                        </Box>
                                    </Box>

                                    {/* Content */}
                                    <Box sx={{ flexGrow: 1 }}>
                                        <Link href={`/story/${encodeURIComponent(story.storyId)}`} target="_blank" style={{ textDecoration: 'none', color: 'inherit' }}>
                                            <Typography variant="h6" fontWeight={800} sx={{ '&:hover': { textDecoration: 'underline', color: 'primary.main' } }}>
                                                {story.title_native}
                                            </Typography>
                                        </Link>
                                        <Stack direction="row" spacing={1} sx={{ mt: 0.5 }}>
                                            <Chip label={(story.language || 'en').toUpperCase()} size="small" sx={{ borderRadius: 0 }} />
                                            <Chip label={`Level ${story.level}`} size="small" variant="outlined" sx={{ borderRadius: 0 }} />
                                            <Chip label={story.theme} size="small" variant="outlined" sx={{ borderRadius: 0 }} />
                                            <Typography variant="caption" sx={{ alignSelf: 'center', color: 'text.secondary', ml: 1 }}>
                                                ID: {story.storyId}
                                            </Typography>
                                        </Stack>
                                    </Box>

                                    {/* Actions */}
                                    <Stack direction="row" spacing={2}>
                                        <Button
                                            variant="contained"
                                            color="primary"
                                            startIcon={<AutoStoriesIcon />}
                                            component={Link as any}
                                            href={`/story/${encodeURIComponent(story.storyId)}`}
                                            target="_blank"
                                            sx={{ fontWeight: 'bold', borderRadius: 0, border: '2px solid #111', boxShadow: '4px 4px 0px #111' }}
                                        >
                                            View
                                        </Button>
                                        <Button
                                            variant="outlined"
                                            color="warning"
                                            startIcon={<RestorePageIcon />}
                                            onClick={() => handleOpenRetract(story)}
                                            sx={{ fontWeight: 'bold', borderRadius: 0, border: '2px solid #111' }}
                                        >
                                            Retract to Review
                                        </Button>
                                    </Stack>
                                </Box>
                            </ListItem>
                        </Paper>
                    ))}
                </List>
            )}

            {/* Retract Dialog */}
            <Dialog open={retractDialogOpen} onClose={() => setRetractDialogOpen(false)} maxWidth="sm" fullWidth>
                <DialogTitle fontWeight={900}>Retract Story?</DialogTitle>
                <DialogContent>
                    <DialogContentText sx={{ mb: 2 }}>
                        This will **remove** "{selectedStory?.title_native}" from the public library and move it back to the **Revision Queue**. It will not be visible to users until re-approved.
                    </DialogContentText>
                    <TextField
                        autoFocus
                        margin="dense"
                        label="Reason for retraction / Revision Note"
                        fullWidth
                        multiline
                        rows={3}
                        value={revisionNote}
                        onChange={(e) => setRevisionNote(e.target.value)}
                        variant="outlined"
                    />
                </DialogContent>
                <DialogActions sx={{ p: 3 }}>
                    <Button onClick={() => setRetractDialogOpen(false)} sx={{ fontWeight: 'bold' }} color="inherit">Cancel</Button>
                    <Button onClick={handleRetract} variant="contained" color="warning" sx={{ fontWeight: 'bold' }}>
                        Confirm Retraction
                    </Button>
                </DialogActions>
            </Dialog>
        </Paper>
    );
}
