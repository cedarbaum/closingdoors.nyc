import { motion } from "framer-motion";

export type Tab = {
  name: string;
  content: React.ReactNode;
  widthPercent: number;
};

type SystemSelectorHeaderProps = {
  tabs: Tab[];
  activeTab: string;
  onTabClick: (tab: string) => void;
};

export const PageSelectorHeader: React.FC<SystemSelectorHeaderProps> = ({
  tabs,
  activeTab,
  onTabClick,
}) => {
  return (
    <div className="flex text-white uppercase">
      {tabs.map((tab) => (
        <button
          className="relative p-4"
          style={{ width: `${tab.widthPercent}%` }}
          key={tab.name}
          onClick={() => onTabClick(tab.name)}
        >
          <motion.div
            className="flex items-center justify-center font-medium uppercase"
            initial={{ opacity: activeTab === tab.name ? "100%" : "50%" }}
            animate={{ opacity: activeTab === tab.name ? "100%" : "50%" }}
          >
            {tab.content}
          </motion.div>
          {activeTab === tab.name && (
            <motion.div
              layoutId="tab-underline"
              className="absolute top-0 left-0 border-b-4 text-white h-full w-full"
            />
          )}
        </button>
      ))}
    </div>
  );
};
