import { useEffect, useState } from "react";
import { useAreas } from "../hooks/useAreas";
import { Area } from "../store/slices/areasSlice";

interface AreaSelection {
    [key: string]: Area | undefined;
}

const AREA_TYPES = [
    { value: "country", label: "Country" },
    { value: "region", label: "Region" },
    { value: "county", label: "County" },
    { value: "sub_county", label: "Sub County" },
    { value: "division", label: "Division" },
    { value: "location", label: "Location" },
    { value: "sub_location", label: "Sub Location" },
    { value: "village", label: "Village" },
];

interface Props {
    onSelectionChange?: (areaId: string | null, area: Area | null) => void;
    className?: string;
}

const CompactAreaSelector = ({ onSelectionChange, className = "" }: Props) => {
    const { loading, loadAreas, loadAreaChildren } = useAreas();

    const [selectedLevel, setSelectedLevel] = useState<string>("");
    const [selections, setSelections] = useState<AreaSelection>({});
    const [availableAreas, setAvailableAreas] = useState<{
        [key: string]: Area[];
    }>({});
    const [loadingStates, setLoadingStates] = useState<{
        [key: string]: boolean;
    }>({});

    const getVisibleLevels = () => {
        if (!selectedLevel) return [];
        const levelIndex = AREA_TYPES.findIndex(
            (type) => type.value === selectedLevel
        );
        return AREA_TYPES.slice(0, levelIndex + 1);
    };

    const visibleLevels = getVisibleLevels();

    useEffect(() => {
        if (selectedLevel) {
            setSelections({});
            setAvailableAreas({});
            setLoadingStates({ country: true });

            loadAreas({ area_type: "country" }).then((result: any) => {
                if (result.payload) {
                    setAvailableAreas({ country: result.payload.data });
                }
                setLoadingStates({ country: false });
            });

            // Reset selection when level changes
            onSelectionChange?.(null, null);
        }
    }, [selectedLevel, loadAreas]);

    const handleAreaSelect = async (
        areaType: string,
        areaId: string,
        area: Area
    ) => {
        const levelIndex = AREA_TYPES.findIndex((type) => type.value === areaType);

        // Create new selections object
        const newSelections: AreaSelection = {};

        // Keep selections up to current level
        AREA_TYPES.slice(0, levelIndex + 1).forEach((type) => {
            if (type.value === areaType) {
                newSelections[type.value] = area;
            } else if (selections[type.value]) {
                newSelections[type.value] = selections[type.value];
            }
        });

        setSelections(newSelections);

        // Only notify parent if this is the target level
        if (areaType === selectedLevel) {
            onSelectionChange?.(area.id, area);
        }

        // Clear available areas below this level
        const newAvailableAreas = { ...availableAreas };
        AREA_TYPES.slice(levelIndex + 1).forEach((type) => {
            delete newAvailableAreas[type.value];
        });

        // Load children if not at the last level
        if (levelIndex < visibleLevels.length - 1) {
            const nextLevel = AREA_TYPES[levelIndex + 1];

            setLoadingStates((prev) => ({ ...prev, [nextLevel.value]: true }));

            try {
                const result = await loadAreaChildren(areaId);
                if (result.payload) {
                    newAvailableAreas[nextLevel.value] = result.payload as Area[];
                }
            } catch (error) {
                console.error("Failed to load children:", error);
            } finally {
                setLoadingStates((prev) => ({ ...prev, [nextLevel.value]: false }));
            }
        }

        setAvailableAreas(newAvailableAreas);
    };

    const isLevelDisabled = (levelValue: string): boolean => {
        if (levelValue === "country") return false;
        const levelIndex = AREA_TYPES.findIndex(
            (type) => type.value === levelValue
        );
        const previousLevel = AREA_TYPES[levelIndex - 1];
        return !selections[previousLevel.value];
    };

    // Check if the target level is selected
    const isTargetLevelSelected = selectedLevel && selections[selectedLevel];


    return (
        <div className={`${className} space-y-6`}>

            {/* ===================== */}
            {/* Row 1: Dropdowns */}
            {/* ===================== */}
            <div className="grid gap-4 grid-cols-[repeat(auto-fit,minmax(220px,1fr))] items-start">

                {/* Level Selector */}
                <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Administrative Level <span className="text-red-500">*</span>
                    </label>
                    <select
                        value={selectedLevel}
                        onChange={(e) => {
                            setSelectedLevel(e.target.value);
                            setSelections({});
                            setAvailableAreas({});
                        }}
                        className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                        <option value="">-- Select Administrative Level --</option>
                        {AREA_TYPES.map((type) => (
                            <option key={type.value} value={type.value}>
                                {type.label}
                            </option>
                        ))}
                    </select>

                    {selectedLevel && (
                        <p className="text-xs text-gray-600 mt-1">
                            Navigate to select a{" "}
                            <span className="font-semibold">
                                {AREA_TYPES.find(t => t.value === selectedLevel)?.label}
                            </span>
                        </p>
                    )}
                </div>

                {/* Cascading Dropdowns */}
                {selectedLevel &&
                    visibleLevels.map((level, index) => {
                        const areas = availableAreas[level.value] || [];
                        const isDisabled = isLevelDisabled(level.value);
                        const selectedValue = selections[level.value]?.id || "";
                        const isLoading = loadingStates[level.value];
                        const isTargetLevel = level.value === selectedLevel;

                        return (
                            <div key={level.value}>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    {level.label}
                                    {index === 0 && <span className="text-red-500 ml-1">*</span>}
                                    {isTargetLevel && (
                                        <span className="ml-2 text-xs font-semibold text-blue-600 bg-blue-50 px-2 py-0.5 rounded">
                                            Target
                                        </span>
                                    )}
                                    {isLoading && (
                                        <span className="ml-2 text-xs text-blue-500">Loading…</span>
                                    )}
                                </label>

                                <select
                                    value={selectedValue}
                                    onChange={(e) => {
                                        const selectedArea = areas.find(a => a.id === e.target.value);
                                        if (selectedArea) {
                                            handleAreaSelect(level.value, e.target.value, selectedArea);
                                        }
                                    }}
                                    disabled={isDisabled || isLoading}
                                    className={`w-full px-3 py-2 border rounded-lg shadow-sm focus:outline-none focus:ring-2 transition
                  ${isTargetLevel
                                            ? "focus:ring-green-500 border-green-300"
                                            : "focus:ring-blue-500 border-gray-300"}
                  ${isDisabled || isLoading
                                            ? "bg-gray-50 text-gray-400 cursor-not-allowed"
                                            : "bg-white"}
                `}
                                >
                                    <option value="">-- Select {level.label} --</option>
                                    {areas.map(area => (
                                        <option key={area.id} value={area.id}>
                                            {area.name}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        );
                    })}
            </div>

            {/* ===================== */}
            {/* Row 2: Breadcrumbs */}
            {/* ===================== */}
            {Object.keys(selections).length > 0 && (
                <div className="p-3 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-100">
                    <p className="text-xs font-semibold text-gray-600 mb-2">
                        Selection Path
                    </p>

                    <div className="flex flex-wrap items-center gap-2 text-sm">
                        {AREA_TYPES.map((type, index) => {
                            const area = selections[type.value];
                            if (!area) return null;

                            const isTarget = type.value === selectedLevel;

                            return (
                                <div key={type.value} className="flex items-center">
                                    <span
                                        className={`px-2 py-1 rounded shadow-sm
                    ${isTarget
                                                ? "bg-green-100 text-green-800 font-semibold border border-green-300"
                                                : "bg-white text-gray-700"
                                            }`}
                                    >
                                        {area.name}
                                    </span>
                                    {index < Object.keys(selections).length - 1 && (
                                        <span className="mx-2 text-gray-400">→</span>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* ===================== */}
            {/* Final Selection Indicator */}
            {/* ===================== */}
            {isTargetLevelSelected && (
                <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                    <div className="flex items-center gap-2">
                        <svg
                            className="w-5 h-5 text-green-600"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        <div>
                            <p className="text-sm font-semibold text-green-800">
                                {AREA_TYPES.find(t => t.value === selectedLevel)?.label} Selected
                            </p>
                            <p className="text-xs text-green-700">
                                {selections[selectedLevel]?.name} ({selections[selectedLevel]?.code})
                            </p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );

}

export default CompactAreaSelector;