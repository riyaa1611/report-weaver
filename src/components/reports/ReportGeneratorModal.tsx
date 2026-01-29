import React, { useState } from 'react';
import { Loader2, Database, Globe, FileSpreadsheet } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import type { DataSourceType, Template } from '@/types';

interface ReportGeneratorModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

// Mock templates for demo
const mockTemplates: Template[] = [
  {
    id: '1',
    name: 'Monthly Sales Report',
    description: 'Comprehensive monthly sales analysis with charts and KPIs',
    thumbnail_url: null,
    category: 'Financial',
    schema: [],
    created_at: new Date().toISOString(),
  },
  {
    id: '2',
    name: 'Customer Analytics',
    description: 'Customer behavior and engagement metrics',
    thumbnail_url: null,
    category: 'Analytics',
    schema: [],
    created_at: new Date().toISOString(),
  },
  {
    id: '3',
    name: 'Inventory Status',
    description: 'Current inventory levels and reorder suggestions',
    thumbnail_url: null,
    category: 'Data',
    schema: [],
    created_at: new Date().toISOString(),
  },
];

const dataSourceOptions: { type: DataSourceType; label: string; icon: React.ElementType; description: string }[] = [
  { type: 'sql', label: 'SQL Database', icon: Database, description: 'Connect to a database' },
  { type: 'api', label: 'REST API', icon: Globe, description: 'Fetch from an API endpoint' },
  { type: 'csv', label: 'CSV File', icon: FileSpreadsheet, description: 'Upload a CSV file' },
];

export const ReportGeneratorModal: React.FC<ReportGeneratorModalProps> = ({
  open,
  onOpenChange,
}) => {
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<string>('');
  const [dataSourceType, setDataSourceType] = useState<DataSourceType | null>(null);
  
  // SQL config
  const [connectionString, setConnectionString] = useState('');
  const [sqlQuery, setSqlQuery] = useState('');
  
  // API config
  const [apiUrl, setApiUrl] = useState('');
  const [apiMethod, setApiMethod] = useState<'GET' | 'POST'>('GET');

  const handleClose = () => {
    onOpenChange(false);
    // Reset form after animation
    setTimeout(() => {
      setStep(1);
      setSelectedTemplate('');
      setDataSourceType(null);
      setConnectionString('');
      setSqlQuery('');
      setApiUrl('');
      setApiMethod('GET');
    }, 200);
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1500));
      toast.success('Report generation started!');
      handleClose();
    } catch {
      toast.error('Failed to generate report');
    } finally {
      setIsSubmitting(false);
    }
  };

  const canProceed = () => {
    if (step === 1) return !!selectedTemplate;
    if (step === 2) return !!dataSourceType;
    if (step === 3) {
      if (dataSourceType === 'sql') return connectionString && sqlQuery;
      if (dataSourceType === 'api') return apiUrl;
      if (dataSourceType === 'csv') return true; // CSV upload would be handled separately
    }
    return false;
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-lg bg-card">
        <DialogHeader>
          <DialogTitle>Generate New Report</DialogTitle>
          <DialogDescription>
            {step === 1 && 'Select a template for your report'}
            {step === 2 && 'Choose how to connect your data'}
            {step === 3 && 'Configure your data source'}
          </DialogDescription>
        </DialogHeader>

        {/* Step Indicator */}
        <div className="flex items-center gap-2 px-1">
          {[1, 2, 3].map((s) => (
            <React.Fragment key={s}>
              <div
                className={cn(
                  'flex h-8 w-8 items-center justify-center rounded-full text-sm font-medium transition-colors',
                  step >= s
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted text-muted-foreground'
                )}
              >
                {s}
              </div>
              {s < 3 && (
                <div
                  className={cn(
                    'h-0.5 flex-1 transition-colors',
                    step > s ? 'bg-primary' : 'bg-muted'
                  )}
                />
              )}
            </React.Fragment>
          ))}
        </div>

        {/* Step 1: Template Selection */}
        {step === 1 && (
          <div className="space-y-3 max-h-64 overflow-y-auto">
            {mockTemplates.map((template) => (
              <button
                key={template.id}
                type="button"
                onClick={() => setSelectedTemplate(template.id)}
                className={cn(
                  'w-full rounded-lg border p-4 text-left transition-all hover:border-primary/50',
                  selectedTemplate === template.id
                    ? 'border-primary bg-accent'
                    : 'border-border bg-card'
                )}
              >
                <p className="font-medium text-foreground">{template.name}</p>
                <p className="mt-1 text-sm text-muted-foreground">{template.description}</p>
                <span className="mt-2 inline-block rounded-full bg-secondary px-2 py-0.5 text-xs font-medium text-secondary-foreground">
                  {template.category}
                </span>
              </button>
            ))}
          </div>
        )}

        {/* Step 2: Data Source Type */}
        {step === 2 && (
          <div className="grid gap-3">
            {dataSourceOptions.map(({ type, label, icon: Icon, description }) => (
              <button
                key={type}
                type="button"
                onClick={() => setDataSourceType(type)}
                className={cn(
                  'flex items-center gap-4 rounded-lg border p-4 text-left transition-all hover:border-primary/50',
                  dataSourceType === type
                    ? 'border-primary bg-accent'
                    : 'border-border bg-card'
                )}
              >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-secondary">
                  <Icon className="h-5 w-5 text-secondary-foreground" />
                </div>
                <div>
                  <p className="font-medium text-foreground">{label}</p>
                  <p className="text-sm text-muted-foreground">{description}</p>
                </div>
              </button>
            ))}
          </div>
        )}

        {/* Step 3: Data Source Configuration */}
        {step === 3 && (
          <div className="space-y-4">
            {dataSourceType === 'sql' && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="connection">Connection String</Label>
                  <Input
                    id="connection"
                    placeholder="postgresql://user:password@host:5432/db"
                    value={connectionString}
                    onChange={(e) => setConnectionString(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="query">SQL Query</Label>
                  <Textarea
                    id="query"
                    placeholder="SELECT * FROM sales WHERE date >= '2025-01-01'"
                    value={sqlQuery}
                    onChange={(e) => setSqlQuery(e.target.value)}
                    rows={4}
                  />
                </div>
              </>
            )}

            {dataSourceType === 'api' && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="url">API URL</Label>
                  <Input
                    id="url"
                    placeholder="https://api.example.com/data"
                    value={apiUrl}
                    onChange={(e) => setApiUrl(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="method">HTTP Method</Label>
                  <Select value={apiMethod} onValueChange={(v) => setApiMethod(v as 'GET' | 'POST')}>
                    <SelectTrigger id="method">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-popover">
                      <SelectItem value="GET">GET</SelectItem>
                      <SelectItem value="POST">POST</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </>
            )}

            {dataSourceType === 'csv' && (
              <div className="rounded-lg border-2 border-dashed p-8 text-center">
                <FileSpreadsheet className="mx-auto h-10 w-10 text-muted-foreground" />
                <p className="mt-2 text-sm font-medium text-foreground">
                  Drag and drop your CSV file
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  Or click to browse
                </p>
                <Button variant="outline" size="sm" className="mt-4">
                  Browse Files
                </Button>
              </div>
            )}
          </div>
        )}

        {/* Actions */}
        <div className="flex justify-between pt-2">
          <Button
            variant="ghost"
            onClick={step === 1 ? handleClose : () => setStep((s) => s - 1)}
          >
            {step === 1 ? 'Cancel' : 'Back'}
          </Button>
          <Button
            onClick={step === 3 ? handleSubmit : () => setStep((s) => s + 1)}
            disabled={!canProceed() || isSubmitting}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Generating...
              </>
            ) : step === 3 ? (
              'Generate Report'
            ) : (
              'Continue'
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
