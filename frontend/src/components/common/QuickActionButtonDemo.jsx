import React, { useState } from "react";
import QuickActionButton from "./QuickActionButton";
import {
  Save,
  Trash2,
  Download,
  Upload,
  RefreshCw,
  Plus,
  Edit,
  Eye,
  Settings,
} from "lucide-react";

const QuickActionButtonDemo = () => {
  const [loading, setLoading] = useState({});

  const handleClick = (buttonId) => {
    setLoading((prev) => ({ ...prev, [buttonId]: true }));
    setTimeout(() => {
      setLoading((prev) => ({ ...prev, [buttonId]: false }));
    }, 2000);
  };

  return (
    <div className="p-8 space-y-8 bg-gray-50 min-h-screen">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">
          Quick Action Button Examples
        </h1>

        {/* Variants */}
        <div className="bg-white rounded-xl p-6 shadow-sm mb-8">
          <h2 className="text-xl font-semibold mb-4">Button Variants</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <QuickActionButton
              onClick={() => handleClick("primary")}
              loading={loading.primary}
              icon={Save}
              variant="primary"
            >
              Primary
            </QuickActionButton>

            <QuickActionButton
              onClick={() => handleClick("secondary")}
              loading={loading.secondary}
              icon={Edit}
              variant="secondary"
            >
              Secondary
            </QuickActionButton>

            <QuickActionButton
              onClick={() => handleClick("success")}
              loading={loading.success}
              icon={Download}
              variant="success"
            >
              Success
            </QuickActionButton>

            <QuickActionButton
              onClick={() => handleClick("danger")}
              loading={loading.danger}
              icon={Trash2}
              variant="danger"
            >
              Danger
            </QuickActionButton>

            <QuickActionButton
              onClick={() => handleClick("warning")}
              loading={loading.warning}
              icon={RefreshCw}
              variant="warning"
            >
              Warning
            </QuickActionButton>
          </div>
        </div>

        {/* Sizes */}
        <div className="bg-white rounded-xl p-6 shadow-sm mb-8">
          <h2 className="text-xl font-semibold mb-4">Button Sizes</h2>
          <div className="flex flex-wrap items-end gap-4">
            <QuickActionButton
              onClick={() => handleClick("small")}
              loading={loading.small}
              icon={Plus}
              size="sm"
            >
              Small
            </QuickActionButton>

            <QuickActionButton
              onClick={() => handleClick("medium")}
              loading={loading.medium}
              icon={Eye}
              size="md"
            >
              Medium
            </QuickActionButton>

            <QuickActionButton
              onClick={() => handleClick("large")}
              loading={loading.large}
              icon={Settings}
              size="lg"
            >
              Large
            </QuickActionButton>
          </div>
        </div>

        {/* Icon Only */}
        <div className="bg-white rounded-xl p-6 shadow-sm mb-8">
          <h2 className="text-xl font-semibold mb-4">Icon Only Buttons</h2>
          <div className="flex flex-wrap gap-4">
            <QuickActionButton
              onClick={() => handleClick("icon1")}
              loading={loading.icon1}
              icon={Save}
              size="sm"
            />

            <QuickActionButton
              onClick={() => handleClick("icon2")}
              loading={loading.icon2}
              icon={Edit}
              variant="secondary"
            />

            <QuickActionButton
              onClick={() => handleClick("icon3")}
              loading={loading.icon3}
              icon={Trash2}
              variant="danger"
              size="lg"
            />
          </div>
        </div>

        {/* Full Width */}
        <div className="bg-white rounded-xl p-6 shadow-sm mb-8">
          <h2 className="text-xl font-semibold mb-4">Full Width Button</h2>
          <QuickActionButton
            onClick={() => handleClick("fullwidth")}
            loading={loading.fullwidth}
            icon={Upload}
            variant="success"
            size="lg"
            className="w-full"
            loadingText="Processing..."
          >
            Upload All Files
          </QuickActionButton>
        </div>

        {/* Disabled State */}
        <div className="bg-white rounded-xl p-6 shadow-sm">
          <h2 className="text-xl font-semibold mb-4">Disabled State</h2>
          <div className="flex flex-wrap gap-4">
            <QuickActionButton disabled icon={Save}>
              Disabled Button
            </QuickActionButton>

            <QuickActionButton disabled icon={Trash2} variant="danger">
              Cannot Delete
            </QuickActionButton>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuickActionButtonDemo;
