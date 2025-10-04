import { fetchUserAnalysis } from '@/lib/data/analysis';
import ChatClient from '../components/ChatClient';

// 1. Add `searchParams` to the component's props.
interface NewChatPageProps {
  searchParams: Promise<{
    analysisId?: string;
  }>;
}

const NewChatPage = async ({ searchParams }: NewChatPageProps) => {
  const analyses = await fetchUserAnalysis();
  
  // 2. Get the analysisId from searchParams
  const initialAnalysisId = (await searchParams).analysisId;

  // 3. Pass it as a new prop to ChatClient.
  return (
    <ChatClient
      chatId="new"
      analyses={analyses}
      initialAnalysisId={initialAnalysisId}
    />
  );
};

export default NewChatPage;
