import { Card, CardHeader, CardContent } from "@/components/ui/card";
import SkeletonLoader from "../../components/SkeletonLoader";

export const AccountUsageSectionSkeleton: React.FC = () => {
  return (
    <Card className="w-full max-w-5xl mb-6 bg-card rounded-lg shadow-md">
      <CardHeader className="flex flex-row justify-between items-center">
        <SkeletonLoader width="w-1/3" height="h-8" />
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
          {/* Stats Skeletons */}
          {[...Array(3)].map((_, i) => (
            <div key={`stat-${i}`}>
              <SkeletonLoader width="w-1/2" height="h-6" className="mb-2" />
              <SkeletonLoader width="w-1/3" height="h-8" />
            </div>
          ))}
          <div className="md:col-span-2 lg:col-span-3">
              <SkeletonLoader width="w-1/2" height="h-6" className="mb-2" />
              <SkeletonLoader width="w-1/3" height="h-8" />
          </div>
           <div>
              <SkeletonLoader width="w-1/2" height="h-6" className="mb-2" />
              <SkeletonLoader width="w-1/3" height="h-8" />
          </div>
        </div>

        <div className="flex justify-end mb-4">
          <SkeletonLoader width="w-[180px]" height="h-10" />
        </div>

        <div className="w-full h-80">
          <SkeletonLoader width="w-full" height="h-full" />
        </div>
        <p className="text-sm text-muted-foreground mt-4 text-center">
          <SkeletonLoader width="w-2/3" height="h-4" className="mx-auto" />
        </p>
      </CardContent>
    </Card>
  );
};
