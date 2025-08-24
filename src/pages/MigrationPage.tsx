import { useState } from 'react';
import { migrateExistingProducts } from '@/controllers/productController';
import { Button } from '@/components/ui/button';

const MigrationPage = () => {
  const [migrationResult, setMigrationResult] = useState<{
    migrated: number;
    skipped: number;
    errors: number;
  } | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleMigration = async () => {
    setIsLoading(true);
    setError(null);
    setMigrationResult(null);
    if (!confirm("Are you sure you want to run the product migration? This is a one-time operation and cannot be undone.")) {
        setIsLoading(false);
        return;
    }
    try {
      const result = await migrateExistingProducts();
      setMigrationResult(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An unknown error occurred.");
      console.error("Migration failed:", err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-4 text-center">
      <h1 className="text-2xl font-bold mb-4">Product Data Migration</h1>
      <p className="mb-4">
        Click the button below to migrate existing product images to the new data structure.
        <br/>
        <b>Warning:</b> This is a one-time operation. Do not run this more than once.
      </p>
      <Button onClick={handleMigration} disabled={isLoading} variant="destructive">
        {isLoading ? 'Migrating...' : 'Start Migration'}
      </Button>
      {migrationResult && (
        <div className="mt-4 p-4 border rounded bg-green-100 text-green-800">
          <h2 className="font-bold">Migration Complete!</h2>
          <p>Products Migrated: {migrationResult.migrated}</p>
          <p>Products Skipped (no images): {migrationResult.skipped}</p>
          <p>Errors: {migrationResult.errors}</p>
        </div>
      )}
      {error && (
        <div className="mt-4 p-4 border rounded bg-red-100 text-red-800">
          <h2 className="font-bold">Migration Failed</h2>
          <p>{error}</p>
        </div>
      )}
    </div>
  );
};

export default MigrationPage;
