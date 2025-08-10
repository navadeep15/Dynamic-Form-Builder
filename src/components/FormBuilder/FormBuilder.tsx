// src/components/FormBuilder/FormBuilder.tsx
import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Fab,
  Alert,
} from '@mui/material';
import { Add as AddIcon, Save as SaveIcon } from '@mui/icons-material';
// import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import FieldConfig from './FieldConfig';
import { FormField, FormSchema, FieldType } from '../../types/formTypes';
import { saveForm } from '../../utils/localStorage';
import { v4 as uuidv4 } from 'uuid';

const FormBuilder: React.FC = () => {
  const [fields, setFields] = useState<FormField[]>([]);
  const [selectedField, setSelectedField] = useState<FormField | null>(null);
  const [showFieldConfig, setShowFieldConfig] = useState(false);
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [formName, setFormName] = useState('');
  const [saveSuccess, setSaveSuccess] = useState(false);

  const fieldTypes: { type: FieldType; label: string }[] = [
    { type: 'text', label: 'Text' },
    { type: 'number', label: 'Number' },
    { type: 'textarea', label: 'Textarea' },
    { type: 'select', label: 'Select' },
    { type: 'radio', label: 'Radio' },
    { type: 'checkbox', label: 'Checkbox' },
    { type: 'date', label: 'Date' },
  ];

  const addField = (type: FieldType) => {
    const newField: FormField = {
      id: uuidv4(),
      type,
      label: `New ${type} field`,
      required: false,
      defaultValue: '',
      validationRules: [],
      options: type === 'select' || type === 'radio' || type === 'checkbox' ? ['Option 1'] : undefined,
      order: fields.length,
    };
    setFields([...fields, newField]);
    setSelectedField(newField);
    setShowFieldConfig(true);
  };

  const updateField = (updatedField: FormField) => {
    setFields(fields.map(field => 
      field.id === updatedField.id ? updatedField : field
    ));
    setSelectedField(null);
    setShowFieldConfig(false);
  };

  const deleteField = (fieldId: string) => {
    setFields(fields.filter(field => field.id !== fieldId));
    if (selectedField?.id === fieldId) {
      setSelectedField(null);
      setShowFieldConfig(false);
    }
  };

  const handleDragEnd = (result: any) => {
    if (!result.destination) return;

    const newFields = Array.from(fields);
    const [reorderedField] = newFields.splice(result.source.index, 1);
    newFields.splice(result.destination.index, 0, reorderedField);

    // Update order property
    const updatedFields = newFields.map((field, index) => ({
      ...field,
      order: index,
    }));

    setFields(updatedFields);
  };

  const saveFormSchema = () => {
    if (!formName.trim()) return;

    const formSchema: FormSchema = {
      id: uuidv4(),
      name: formName,
      fields: fields.sort((a, b) => a.order - b.order),
      createdAt: new Date().toISOString(),
    };

    saveForm(formSchema);
    setShowSaveDialog(false);
    setFormName('');
    setSaveSuccess(true);
    
    // Store current form in sessionStorage for preview
    sessionStorage.setItem('currentForm', JSON.stringify(formSchema));

    setTimeout(() => setSaveSuccess(false), 3000);
  };

  // Auto-save current form to sessionStorage for preview
  useEffect(() => {
    if (fields.length > 0) {
      const currentForm: FormSchema = {
        id: 'preview',
        name: 'Preview Form',
        fields: fields.sort((a, b) => a.order - b.order),
        createdAt: new Date().toISOString(),
      };
      sessionStorage.setItem('currentForm', JSON.stringify(currentForm));
    }
  }, [fields]);

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Form Builder
      </Typography>

      {saveSuccess && (
        <Alert severity="success" sx={{ mb: 2 }}>
          Form saved successfully!
        </Alert>
      )}

      {/* Field Type Buttons */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Add Fields
        </Typography>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
          {fieldTypes.map((fieldType) => (
            <Button
              key={fieldType.type}
              variant="outlined"
              startIcon={<AddIcon />}
              onClick={() => addField(fieldType.type)}
            >
              {fieldType.label}
            </Button>
          ))}
        </Box>
      </Paper>

      {/* Form Fields */}
      <DragDropContext onDragEnd={handleDragEnd}>
        <Droppable droppableId="formFields">
          {(provided) => (
            <Box {...provided.droppableProps} ref={provided.innerRef}>
              {fields.map((field, index) => (
                <Draggable key={field.id} draggableId={field.id} index={index}>
                  {(provided, snapshot) => (
                    <Paper
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      {...provided.dragHandleProps}
                      sx={{
                        p: 2,
                        mb: 2,
                        cursor: 'grab',
                        backgroundColor: snapshot.isDragging ? 'grey.100' : 'white',
                        border: '1px solid',
                        borderColor: 'grey.300',
                      }}
                      onClick={() => {
                        setSelectedField(field);
                        setShowFieldConfig(true);
                      }}
                    >
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Box>
                          <Typography variant="subtitle1">{field.label}</Typography>
                          <Typography variant="caption" color="text.secondary">
                            Type: {field.type} | Required: {field.required ? 'Yes' : 'No'}
                            {field.isDerived && ' | Derived Field'}
                          </Typography>
                        </Box>
                        <Button
                          color="error"
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteField(field.id);
                          }}
                        >
                          Delete
                        </Button>
                      </Box>
                    </Paper>
                  )}
                </Draggable>
              ))}
              {provided.placeholder}
            </Box>
          )}
        </Droppable>
      </DragDropContext>

      {fields.length === 0 && (
        <Paper sx={{ p: 4, textAlign: 'center', color: 'text.secondary' }}>
          <Typography variant="h6">No fields added yet</Typography>
          <Typography>Click on a field type above to get started</Typography>
        </Paper>
      )}

      {/* Save Button */}
      {fields.length > 0 && (
        <Fab
          color="primary"
          aria-label="save"
          sx={{ position: 'fixed', bottom: 16, right: 16 }}
          onClick={() => setShowSaveDialog(true)}
        >
          <SaveIcon />
        </Fab>
      )}

      {/* Field Configuration Dialog */}
      {showFieldConfig && selectedField && (
        <FieldConfig
          field={selectedField}
          allFields={fields}
          open={showFieldConfig}
          onClose={() => setShowFieldConfig(false)}
          onSave={updateField}
        />
      )}

      {/* Save Form Dialog */}
      <Dialog open={showSaveDialog} onClose={() => setShowSaveDialog(false)}>
        <DialogTitle>Save Form</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Form Name"
            fullWidth
            variant="outlined"
            value={formName}
            onChange={(e) => setFormName(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowSaveDialog(false)}>Cancel</Button>
          <Button onClick={saveFormSchema} disabled={!formName.trim()}>
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default FormBuilder;
