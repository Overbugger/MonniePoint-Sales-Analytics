import { metadata } from "~/app/layout";

interface AnalyticsCardProps {
    heading: string;
    metadataOne: string;
    metadataTwo: string;
}

export default function AnalyticsCard({ heading, metadataOne, metadataTwo }: AnalyticsCardProps) {
    return (
        <div className="bg-gray-800 p-4 rounded-lg">
              <h2 className="text-xl font-bold mb-2">{heading}</h2>
              <div className="flex items-center justify-between">
              <p>{metadataOne}</p>
              <p>{metadataTwo} units</p>
              </div>
            </div>
    )
}