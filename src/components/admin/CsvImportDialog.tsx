import { useState, useCallback, useRef } from 'react';
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Upload, FileText, AlertTriangle, CheckCircle2, Loader2, Download } from 'lucide-react';
import { personSchema } from '@/lib/validations';
import { supabase } from '@/integrations/supabase/client';
import { useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';

interface CsvImportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  prospectType: 'sales' | 'hiring' | 'growth';
}

interface ParsedRow {
  name: string;
  email: string;
  phone: string;
  company: string;
  role: string;
  linkedin: string;
  tags: string;
  quality_score: string;
  notes: string;
  source: string;
}

interface ValidatedRow {
  row: ParsedRow;
  rowIndex: number;
  valid: boolean;
  error?: string;
}

const EXPECTED_HEADERS = ['name', 'email', 'phone', 'company', 'role', 'linkedin', 'tags', 'quality_score', 'notes', 'source'];

function parseCsvLine(line: string): string[] {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (char === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      result.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }
  result.push(current.trim());
  return result;
}

function parseCsv(text: string): { headers: string[]; rows: ParsedRow[] } {
  const lines = text.split(/\r?\n/).filter(line => line.trim());
  if (lines.length === 0) return { headers: [], rows: [] };

  const headers = parseCsvLine(lines[0]).map(h => h.toLowerCase().replace(/[^a-z0-9_]/g, '_'));
  const rows: ParsedRow[] = [];

  for (let i = 1; i < lines.length; i++) {
    const values = parseCsvLine(lines[i]);
    const row: Record<string, string> = {};
    headers.forEach((h, idx) => { row[h] = values[idx] || ''; });
    rows.push({
      name: row.name || '',
      email: row.email || '',
      phone: row.phone || '',
      company: row.company || '',
      role: row.role || '',
      linkedin: row.linkedin || '',
      tags: row.tags || '',
      quality_score: row.quality_score || '',
      notes: row.notes || '',
      source: row.source || '',
    });
  }

  return { headers, rows };
}

function validateRows(rows: ParsedRow[]): ValidatedRow[] {
  return rows.map((row, index) => {
    const result = personSchema.safeParse({
      name: row.name,
      email: row.email || undefined,
      phone: row.phone || undefined,
      company: row.company || undefined,
      role: row.role || undefined,
      linkedin: row.linkedin || undefined,
      tags: row.tags ? row.tags.split(';').map(t => t.trim()).filter(Boolean) : undefined,
    });

    if (!result.success) {
      return { row, rowIndex: index + 2, valid: false, error: result.error.errors[0]?.message || 'Invalid data' };
    }
    return { row, rowIndex: index + 2, valid: true };
  });
}

const SAMPLE_CSV = `name,email,phone,company,role,linkedin,tags,quality_score,notes,source
John Smith,john@acme.com,+1234567890,Acme Corp,CEO,https://linkedin.com/in/johnsmith,B2B;SaaS,75,Interested in our services,Website
Jane Doe,jane@example.com,,Example Inc,CTO,,Fintech;Startups,60,,Referral`;

export default function CsvImportDialog({ open, onOpenChange, prospectType }: CsvImportDialogProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [step, setStep] = useState<'upload' | 'preview' | 'importing' | 'done'>('upload');
  const [validated, setValidated] = useState<ValidatedRow[]>([]);
  const [importProgress, setImportProgress] = useState(0);
  const [importResults, setImportResults] = useState({ success: 0, failed: 0 });
  const [fileName, setFileName] = useState('');

  const reset = useCallback(() => {
    setStep('upload');
    setValidated([]);
    setImportProgress(0);
    setImportResults({ success: 0, failed: 0 });
    setFileName('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  }, []);

  const handleClose = (v: boolean) => {
    if (!v) reset();
    onOpenChange(v);
  };

  const handleFile = useCallback((file: File) => {
    if (!file.name.endsWith('.csv')) {
      toast({ title: 'Invalid file', description: 'Please upload a .csv file', variant: 'destructive' });
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast({ title: 'File too large', description: 'Maximum file size is 5MB', variant: 'destructive' });
      return;
    }

    setFileName(file.name);
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      const { rows } = parseCsv(text);
      if (rows.length === 0) {
        toast({ title: 'Empty file', description: 'No data rows found in CSV', variant: 'destructive' });
        return;
      }
      if (rows.length > 500) {
        toast({ title: 'Too many rows', description: 'Maximum 500 rows per import', variant: 'destructive' });
        return;
      }
      const result = validateRows(rows);
      setValidated(result);
      setStep('preview');
    };
    reader.readAsText(file);
  }, [toast]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  }, [handleFile]);

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  }, [handleFile]);

  const downloadTemplate = () => {
    const blob = new Blob([SAMPLE_CSV], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `prospects_${prospectType}_template.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const startImport = async () => {
    const validRows = validated.filter(v => v.valid);
    if (validRows.length === 0) return;

    setStep('importing');
    setImportProgress(0);

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      toast({ title: 'Not authenticated', variant: 'destructive' });
      return;
    }
    const { data: orgId } = await supabase.rpc('get_user_org_id', { _user_id: user.id });

    let success = 0;
    let failed = 0;
    const batchSize = 10;

    for (let i = 0; i < validRows.length; i += batchSize) {
      const batch = validRows.slice(i, i + batchSize);

      const peopleInserts = batch.map(v => ({
        name: v.row.name,
        email: v.row.email || null,
        phone: v.row.phone || null,
        company: v.row.company || null,
        role: v.row.role || null,
        linkedin: v.row.linkedin || null,
        tags: v.row.tags ? v.row.tags.split(';').map(t => t.trim()).filter(Boolean) : null,
        organization_id: orgId || null,
      }));

      const { data: people, error: peopleErr } = await supabase
        .from('people')
        .insert(peopleInserts)
        .select('id');

      if (peopleErr || !people) {
        failed += batch.length;
      } else {
        const leadsInserts = people.map((p, idx) => {
          const row = batch[idx].row;
          const score = parseInt(row.quality_score);
          return {
            person_id: p.id,
            quality_score: isNaN(score) ? null : Math.min(100, Math.max(0, score)),
            notes: row.notes || null,
            source: row.source || null,
            organization_id: orgId || null,
            prospect_type: prospectType,
          };
        });

        const { error: leadsErr } = await supabase.from('leads').insert(leadsInserts as any);
        if (leadsErr) {
          failed += batch.length;
        } else {
          success += batch.length;
        }
      }

      setImportProgress(Math.round(((i + batch.length) / validRows.length) * 100));
    }

    setImportResults({ success, failed });
    setStep('done');
    queryClient.invalidateQueries({ queryKey: ['admin-prospects'] });
  };

  const validCount = validated.filter(v => v.valid).length;
  const invalidCount = validated.filter(v => !v.valid).length;

  const typeLabel = prospectType === 'sales' ? 'For Sales' : prospectType === 'hiring' ? 'For Hiring' : 'For Growth';

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>
            {step === 'upload' && 'Import Prospects via CSV'}
            {step === 'preview' && 'Review Import Data'}
            {step === 'importing' && 'Importing...'}
            {step === 'done' && 'Import Complete'}
          </DialogTitle>
          <DialogDescription>
            {step === 'upload' && `Upload a CSV file to bulk import prospects into "${typeLabel}".`}
            {step === 'preview' && `${validCount} valid, ${invalidCount} invalid rows from ${fileName}`}
            {step === 'importing' && 'Please wait while prospects are being imported.'}
            {step === 'done' && `${importResults.success} imported, ${importResults.failed} failed.`}
          </DialogDescription>
        </DialogHeader>

        {step === 'upload' && (
          <div className="space-y-4 py-2">
            <div
              className="border-2 border-dashed border-border rounded-lg p-8 text-center cursor-pointer hover:border-foreground/30 transition-colors"
              onDragOver={e => e.preventDefault()}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
            >
              <Upload className="h-10 w-10 mx-auto text-muted-foreground mb-3" />
              <p className="text-sm font-medium">Drag & drop a CSV file here</p>
              <p className="text-xs text-muted-foreground mt-1">or click to browse — max 500 rows, 5MB</p>
              <input ref={fileInputRef} type="file" accept=".csv" className="hidden" onChange={handleInputChange} />
            </div>

            <div className="flex items-center justify-between">
              <Button variant="outline" size="sm" onClick={downloadTemplate}>
                <Download className="h-3.5 w-3.5 mr-1.5" /> Download Template
              </Button>
              <p className="text-xs text-muted-foreground">
                Columns: {EXPECTED_HEADERS.join(', ')}
              </p>
            </div>
          </div>
        )}

        {step === 'preview' && (
          <div className="flex-1 overflow-hidden space-y-3">
            <div className="flex items-center gap-3">
              <Badge variant="outline" className="gap-1">
                <FileText className="h-3 w-3" /> {fileName}
              </Badge>
              {validCount > 0 && (
                <Badge className="gap-1 bg-emerald-500/10 text-emerald-600 border-emerald-500/20">
                  <CheckCircle2 className="h-3 w-3" /> {validCount} valid
                </Badge>
              )}
              {invalidCount > 0 && (
                <Badge className="gap-1 bg-red-500/10 text-red-600 border-red-500/20">
                  <AlertTriangle className="h-3 w-3" /> {invalidCount} invalid
                </Badge>
              )}
            </div>

            <ScrollArea className="h-[300px] border rounded-md">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12">#</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Company</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Tags</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {validated.map((v, i) => (
                    <TableRow key={i} className={v.valid ? '' : 'bg-destructive/5'}>
                      <TableCell className="text-xs text-muted-foreground">{v.rowIndex}</TableCell>
                      <TableCell>
                        {v.valid ? (
                          <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                        ) : (
                          <span className="flex items-center gap-1 text-xs text-destructive">
                            <AlertTriangle className="h-3.5 w-3.5" /> {v.error}
                          </span>
                        )}
                      </TableCell>
                      <TableCell className="font-medium text-sm">{v.row.name || '—'}</TableCell>
                      <TableCell className="text-sm">{v.row.email || '—'}</TableCell>
                      <TableCell className="text-sm">{v.row.company || '—'}</TableCell>
                      <TableCell className="text-sm">{v.row.role || '—'}</TableCell>
                      <TableCell className="text-sm">{v.row.tags || '—'}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </ScrollArea>
          </div>
        )}

        {step === 'importing' && (
          <div className="py-8 space-y-4">
            <Progress value={importProgress} className="h-2" />
            <p className="text-sm text-center text-muted-foreground">
              Importing {validCount} prospects... {importProgress}%
            </p>
          </div>
        )}

        {step === 'done' && (
          <div className="py-8 text-center space-y-3">
            {importResults.success > 0 && (
              <div className="flex items-center justify-center gap-2 text-emerald-600">
                <CheckCircle2 className="h-5 w-5" />
                <span className="font-medium">{importResults.success} prospects imported successfully</span>
              </div>
            )}
            {importResults.failed > 0 && (
              <div className="flex items-center justify-center gap-2 text-destructive">
                <AlertTriangle className="h-5 w-5" />
                <span className="font-medium">{importResults.failed} rows failed to import</span>
              </div>
            )}
          </div>
        )}

        <DialogFooter>
          {step === 'upload' && (
            <Button variant="outline" onClick={() => handleClose(false)}>Cancel</Button>
          )}
          {step === 'preview' && (
            <>
              <Button variant="outline" onClick={reset}>Back</Button>
              <Button onClick={startImport} disabled={validCount === 0}>
                Import {validCount} Prospect{validCount !== 1 ? 's' : ''}
              </Button>
            </>
          )}
          {step === 'importing' && (
            <Button disabled><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Importing...</Button>
          )}
          {step === 'done' && (
            <Button onClick={() => handleClose(false)}>Done</Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
