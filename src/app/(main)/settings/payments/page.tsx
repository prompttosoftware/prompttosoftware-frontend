import SavedCardsList from '../../components/SavedCardsList';

export default function PaymentsPage() {
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Payment Methods</h1>
      <SavedCardsList />
    </div>
  );
}
