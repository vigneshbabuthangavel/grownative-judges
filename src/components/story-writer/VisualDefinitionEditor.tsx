import React, { useState, useEffect } from 'react';
import {
    Box, Typography, TextField, Tabs, Tab, Button,
    Accordion, AccordionSummary, AccordionDetails,
    Grid, Card, CardContent, Divider
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import EditIcon from '@mui/icons-material/Edit';
import SaveIcon from '@mui/icons-material/Save';
import { UnifiedStory } from '@/lib/story-writer/types';

interface Props {
    story: UnifiedStory;
    onSave: (updatedDefinition: any) => void;
    onCancel: () => void;
}

export const VisualDefinitionEditor: React.FC<Props> = ({ story, onSave, onCancel }) => {
    // Local state for editing
    const [definition, setDefinition] = useState<any>(JSON.parse(JSON.stringify(story.visual_definition)));
    const [activeTab, setActiveTab] = useState(0);

    const handleActorChange = (actorId: string, field: string, value: string) => {
        setDefinition((prev: any) => ({
            ...prev,
            actors: {
                ...prev.actors,
                [actorId]: {
                    ...prev.actors[actorId],
                    [field]: value
                }
            }
        }));
    };

    const handleActorDNAChange = (actorId: string, category: 'dna' | 'clothing', feature: string, value: string) => {
        setDefinition((prev: any) => {
            const actor = prev.actors[actorId];
            const updatedActor = { ...actor };

            // Logic to handle nested updates
            if (category === 'clothing') {
                // Clothing is nested INSIDE dna
                updatedActor.dna = {
                    ...actor.dna,
                    clothing: {
                        ...actor.dna.clothing,
                        [feature]: value
                    }
                };
            } else {
                // Standard DNA fields (hair, face, etc.)
                updatedActor.dna = {
                    ...actor.dna,
                    [feature]: value
                };
            }

            return {
                ...prev,
                actors: {
                    ...prev.actors,
                    [actorId]: updatedActor
                }
            };
        });
    };

    const handleEnvChange = (field: string, value: any) => {
        setDefinition((prev: any) => ({
            ...prev,
            environment: {
                ...prev.environment,
                [field]: value
            }
        }));
    };

    const actorKeys = Object.keys(definition.actors || {});

    return (
        <Card sx={{ mt: 2, mb: 2, border: '2px solid #1976d2' }}>
            <CardContent>
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                    <Typography variant="h6" color="primary" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <EditIcon /> Visual Concept Tool ("Color Area")
                    </Typography>
                    <Box>
                        <Button onClick={onCancel} color="inherit" sx={{ mr: 1 }}>Cancel</Button>
                        <Button
                            variant="contained"
                            color="success"
                            startIcon={<SaveIcon />}
                            onClick={() => onSave(definition)}
                        >
                            Render Scenes
                        </Button>
                    </Box>
                </Box>

                <Typography variant="body2" color="text.secondary" paragraph>
                    Review and edit the visual instructions before the Image Engine starts.
                    Changes here will strictly enforce consistency across all pages.
                </Typography>

                <Tabs value={activeTab} onChange={(_, v) => setActiveTab(v)} sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
                    <Tab label="Environment & Style" />
                    {actorKeys.map(key => (
                        <Tab key={key} label={definition.actors[key].name || key} />
                    ))}
                </Tabs>

                {/* TAB 0: ENVIRONMENT */}
                {activeTab === 0 && (
                    <Grid container spacing={2}>
                        <Grid size={{ xs: 12 }}>
                            <TextField
                                fullWidth
                                label="Primary Location"
                                value={definition.environment.primary_location}
                                onChange={(e) => handleEnvChange('primary_location', e.target.value)}
                                helperText="The main setting for the story."
                            />
                        </Grid>
                        <Grid size={{ xs: 12 }}>
                            <Typography variant="subtitle2" gutterBottom>Key Elements (Comma Separated)</Typography>
                            <TextField
                                fullWidth
                                multiline
                                rows={2}
                                value={Array.isArray(definition.environment.key_elements) ? definition.environment.key_elements.join(', ') : definition.environment.key_elements}
                                onChange={(e) => handleEnvChange('key_elements', e.target.value.split(',').map((s: string) => s.trim()))}
                            />
                        </Grid>
                        <Grid size={{ xs: 12 }}>
                            <Typography variant="subtitle2" gutterBottom>Style Engine</Typography>
                            <TextField
                                fullWidth
                                disabled
                                value={definition.style_engine}
                                helperText="Style is locked to ensure consistency."
                            />
                        </Grid>
                    </Grid>
                )}

                {/* ACTOR TABS */}
                {actorKeys.map((key, index) => (
                    activeTab === index + 1 && (
                        <Grid container spacing={2} key={key}>
                            <Grid size={{ xs: 12, sm: 6 }}>
                                <TextField
                                    fullWidth label="Name"
                                    value={definition.actors[key].name}
                                    onChange={(e) => handleActorChange(key, 'name', e.target.value)}
                                />
                            </Grid>
                            <Grid size={{ xs: 12, sm: 6 }}>
                                <TextField
                                    fullWidth label="Role" disabled
                                    value={definition.actors[key].role}
                                />
                            </Grid>

                            <Grid size={{ xs: 12 }}>
                                <Divider textAlign="left">PHYSICAL DNA</Divider>
                            </Grid>
                            {Object.keys(definition.actors[key].dna || {})
                                .filter(k => typeof definition.actors[key].dna[k] === 'string') // Exclude nested objects like 'clothing'
                                .map(feature => (
                                    <Grid size={{ xs: 12, sm: 4 }} key={feature}>
                                        <TextField
                                            fullWidth
                                            label={feature.toUpperCase()}
                                            value={definition.actors[key].dna[feature]}
                                            onChange={(e) => handleActorDNAChange(key, 'dna', feature, e.target.value)}
                                        />
                                    </Grid>
                                ))}

                            <Grid size={{ xs: 12 }}>
                                <Divider textAlign="left">CLOTHING & PROPS</Divider>
                            </Grid>
                            {Object.keys(definition.actors[key].dna.clothing || {}).map(item => (
                                <Grid size={{ xs: 12, sm: 6 }} key={item}>
                                    <TextField
                                        fullWidth
                                        label={item.toUpperCase()}
                                        value={definition.actors[key].dna.clothing[item]}
                                        onChange={(e) => handleActorDNAChange(key, 'clothing', item, e.target.value)}
                                    />
                                </Grid>
                            ))}
                        </Grid>
                    )
                ))}
            </CardContent>
        </Card>
    );
};
