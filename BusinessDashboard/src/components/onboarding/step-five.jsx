import { ImageUpload } from './image-upload';

export function OnboardingStepFive({ formData, updateFormData }) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Business Verification</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Upload documents to verify your business ownership
        </p>
      </div>

      <div className="space-y-4">
        <ImageUpload
          label="Business License or Registration"
          description="Upload business license (PDF, JPG, or PNG up to 10MB)"
          value={formData.businessLicense}
          onChange={(document) => updateFormData({ businessLicense: document })}
          multiple={false}
          accept=".pdf,.jpg,.jpeg,.png,image/*,application/pdf"
          uploadEndpoint="/business/upload/documents"
          extraFormData={{ type: 'license' }}
          maxSizeMb={10}
          buttonText="Select Document"
        />

        <ImageUpload
          label="Proof of Address (Optional)"
          description="Upload utility bill or lease (PDF, JPG, or PNG up to 10MB)"
          value={formData.proofOfAddress}
          onChange={(document) => updateFormData({ proofOfAddress: document })}
          multiple={false}
          accept=".pdf,.jpg,.jpeg,.png,image/*,application/pdf"
          uploadEndpoint="/business/upload/documents"
          extraFormData={{ type: 'other' }}
          maxSizeMb={10}
          buttonText="Select Document"
        />

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

//     </div>
//   );
// }
