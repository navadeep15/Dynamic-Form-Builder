// src/components/MyForms/MyForms.tsx
import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Card, 
  CardContent, 
  CardActions, 
  Button, 
  Grid,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { FormSchema } from '../../types/formTypes';
import { getForms, deleteForm } from '../../utils/localStorage';

const MyForms: React.FC = () => {
  const [forms, setForms] = useState<FormSchema[]>([]);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [formToDelete, setFormToDelete] = useState<FormSchema | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    loadForms();
  }, []);

  const loadForms = () => {
    const savedForms = getForms();
    setForms(savedForms.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
  };

  const handlePreview = (formId: string) => {
    navigate(`/preview/${formId}`);
  };

  const handleDelete = (form: FormSchema) => {
    setFormToDelete(form);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (formToDelete) {
      deleteForm(formToDelete.id);
      loadForms();
      setDeleteDialogOpen(false);
      setFormToDelete(null);
    }
  };

  if (forms.length === 0) {
    return (
      <Box>
        <Typography variant="h4" gutterBottom>
          My Forms
        </Typography>
        <Card sx={{ textAlign: 'center', p: 4 }}>
          <CardContent>
            <Typography variant="h6" color="text.secondary">
              No forms saved yet
            </Typography>
            <Typography color="text.secondary">
              Create your first form to see it here
            </Typography>
          </CardContent>
          <CardActions sx={{ justifyContent: 'center' }}>
            <Button variant="contained" onClick={() => navigate('/create')}>
              Create Form
            </Button>
          </CardActions>
        </Card>
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        My Forms ({forms.length})
      </Typography>
      
      <Grid container spacing={3}>
        {forms.map((form) => (
          <Grid size={{ xs: 12, sm: 6, md: 4 }} key={form.id}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  {form.name}
                </Typography>
                <Typography color="text.secondary" gutterBottom>
                  Created: {new Date(form.createdAt).toLocaleDateString()}
                </Typography>
                <Typography variant="body2">
                  {form.fields.length} field{form.fields.length !== 1 ? 's' : ''}
                </Typography>
              </CardContent>
              <CardActions>
                <Button 
                  size="small" 
                  variant="contained"
                  onClick={() => handlePreview(form.id)}
                >
                  Preview
                </Button>
                <Button 
                  size="small" 
                  color="error"
                  onClick={() => handleDelete(form)}
                >
                  Delete
                </Button>
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>Delete Form</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete "{formToDelete?.name}"? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
          <Button onClick={confirmDelete} color="error" variant="contained">
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default MyForms;
