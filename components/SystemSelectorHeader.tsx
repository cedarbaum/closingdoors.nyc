import { motion } from "framer-motion";

type SystemSelectorHeaderProps = {
  tabs: string[];
  activeTab: string;
  onTabClick: (tab: string) => void;
};

export const SystemSelectorHeader: React.FC<SystemSelectorHeaderProps> = ({
  tabs,
  activeTab,
  onTabClick,
}) => {
  return (
    <div className="flex text-white uppercase">
      {tabs.map((tab) => (
        <button
          className="relative p-4"
          style={{ width: `${100 / tabs.length}%` }}
          key={tab}
          onClick={() => onTabClick(tab)}
        >
          <motion.div
            className="font-medium uppercase"
            initial={{ opacity: activeTab === tab ? "100%" : "50%" }}
            animate={{ opacity: activeTab === tab ? "100%" : "50%" }}
          >
            {tab}
          </motion.div>
          {activeTab === tab && (
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
