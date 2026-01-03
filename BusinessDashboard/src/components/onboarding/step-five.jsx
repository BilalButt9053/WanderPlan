import { Button } from '../ui/button';
import { Label } from '../ui/label';
import { Upload, FileText } from 'lucide-react';

export function OnboardingStepFive({ formData, updateFormData }) {
  const handleLicenseUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      updateFormData({ businessLicense: file });
    }
  };

  const handleProofUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      updateFormData({ proofOfAddress: file });
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Business Verification</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Upload documents to verify your business ownership
        </p>
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <Label>Business License or Registration</Label>
          <label
            htmlFor="license-upload"
            className="border-2 border-dashed border-border rounded-lg p-8 flex flex-col items-center justify-center gap-3 hover:border-primary/50 transition-colors cursor-pointer bg-secondary/50"
          >
            <FileText className="h-10 w-10 text-muted-foreground" />
            <div className="text-center">
              <p className="text-sm font-medium">Upload business license</p>
              <p className="text-xs text-muted-foreground">
                PDF, JPG, or PNG up to 10MB
              </p>
            </div>
            <Button variant="outline" size="sm" type="button">
              <Upload className="h-4 w-4 mr-2" />
              Choose File
            </Button>
            <input
              id="license-upload"
              type="file"
              accept=".pdf,.jpg,.jpeg,.png"
              className="hidden"
              onChange={handleLicenseUpload}
            />
          </label>
          {formData.businessLicense && (
            <p className="text-sm text-muted-foreground">
              Selected: {formData.businessLicense.name}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label>Proof of Address (Optional)</Label>
          <label
            htmlFor="proof-upload"
            className="border-2 border-dashed border-border rounded-lg p-8 flex flex-col items-center justify-center gap-3 hover:border-primary/50 transition-colors cursor-pointer bg-secondary/50"
          >
            <FileText className="h-10 w-10 text-muted-foreground" />
            <div className="text-center">
              <p className="text-sm font-medium">Upload utility bill or lease</p>
              <p className="text-xs text-muted-foreground">
                PDF, JPG, or PNG up to 10MB
              </p>
            </div>
            <Button variant="outline" size="sm" type="button">
              <Upload className="h-4 w-4 mr-2" />
              Choose File
            </Button>
            <input
              id="proof-upload"
              type="file"
              accept=".pdf,.jpg,.jpeg,.png"
              className="hidden"
              onChange={handleProofUpload}
            />
          </label>
          {formData.proofOfAddress && (
            <p className="text-sm text-muted-foreground">
              Selected: {formData.proofOfAddress.name}
            </p>
          )}
        </div>

        <div className="bg-muted/50 border border-border rounded-lg p-4">
          <p className="text-sm text-muted-foreground">
            Your documents will be reviewed within 1-2 business days. You'll receive
            an email once your account is verified.
          </p>
        </div>
      </div>
    </div>
  );
}
