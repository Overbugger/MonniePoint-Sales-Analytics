import { metadata } from "~/app/layout";

interface AnalyticsCardProps {
    heading: string;
    metadataOne: string;
    metadataTwo: string;
    metadataOneHead: string;
    metadataTwoHead: string;
}

export default function AnalyticsCard({ heading, metadataOne,metadataOneHead, metadataTwo, metadataTwoHead }: AnalyticsCardProps) {
    return (
        <div className="bg-gray-800 p-4 rounded-lg">
              <h2 className="text-xl font-bold mb-2 text-center">{heading}</h2>
              <div className="flex items-center justify-between">
                <span className="flex flex-col">
                <p className="text-sm text-gray-300">{metadataOneHead}</p>
              <p>{metadataOne}</p>
                </span >
                <span className="flex flex-col">
                <p className="text-sm text-gray-300">{metadataTwoHead}</p>
              <p>{metadataTwo} units</p>
              </span>
              </div>
            </div>
    )
}