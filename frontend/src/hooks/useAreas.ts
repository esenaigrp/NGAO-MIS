import { useCallback } from "react";
import {
  fetchAreas,
  fetchAreaById,
  fetchAreaChildren,
  fetchAreaHierarchy,
  fetchGeoJSON,
  fetchAreaTypes,
  fetchAreasByType,
  fetchAreasByTypeGeoJSON,
  fetchUserAreas,
  setSelectedArea,
  clearSelectedArea,
  setFilters,
  clearFilters,
  clearError,
  clearGeoJSON,
  FetchAreasParams,
  FetchGeoJSONParams,
  Area,
} from "../store/slices/areasSlice";
import { useAppDispatch, useAppSelector } from "../store/hooks";

export const useAreas = () => {
  const dispatch = useAppDispatch();
  const {
    areas,
    selectedArea,
    areaChildren,
    areaHierarchy,
    geoJsonData,
    areaTypes,
    areasByType,
    loading,
    childrenLoading,
    geoJsonLoading,
    error,
    filters,
  } = useAppSelector((state) => state.areas);

  const loadAreas = useCallback(
    (params?: FetchAreasParams) => {
      return dispatch(fetchAreas(params || {}));
    },
    [dispatch]
  );

  const loadAreaById = useCallback(
    (id: string) => {
      return dispatch(fetchAreaById(id));
    },
    [dispatch]
  );

  const loadAreaChildren = useCallback(
    (id: string) => {
      return dispatch(fetchAreaChildren(id));
    },
    [dispatch]
  );

  const loadAreaHierarchy = useCallback(
    (id: string) => {
      return dispatch(fetchAreaHierarchy(id));
    },
    [dispatch]
  );

  const loadGeoJSON = useCallback(
    (params?: FetchGeoJSONParams) => {
      return dispatch(fetchGeoJSON(params || {}));
    },
    [dispatch]
  );

  const loadAreaTypes = useCallback(() => {
    return dispatch(fetchAreaTypes());
  }, [dispatch]);

  const loadAreasByType = useCallback(
    (area_type: string, parent?: string) => {
      return dispatch(fetchAreasByType({ area_type, parent }));
    },
    [dispatch]
  );

  const loadAreasByTypeGeoJSON = useCallback(
    (area_type: string, parent?: string, recursive?: boolean) => {
      return dispatch(
        fetchAreasByTypeGeoJSON({ area_type, parent, recursive })
      );
    },
    [dispatch]
  );

  const loadUserAreas = useCallback(() => {
    return dispatch(fetchUserAreas());
  }, [dispatch]);

  const selectArea = useCallback(
    (area: Area | null) => {
      dispatch(setSelectedArea(area));
    },
    [dispatch]
  );

  const deselectArea = useCallback(() => {
    dispatch(clearSelectedArea());
  }, [dispatch]);

  const updateFilters = useCallback(
    (newFilters: FetchAreasParams) => {
      dispatch(setFilters(newFilters));
    },
    [dispatch]
  );

  const resetFilters = useCallback(() => {
    dispatch(clearFilters());
  }, [dispatch]);

  const dismissError = useCallback(() => {
    dispatch(clearError());
  }, [dispatch]);

  const resetGeoJSON = useCallback(() => {
    dispatch(clearGeoJSON());
  }, [dispatch]);

  return {
    // State
    areas,
    selectedArea,
    areaChildren,
    areaHierarchy,
    geoJsonData,
    areaTypes,
    areasByType,
    loading,
    childrenLoading,
    geoJsonLoading,
    error,
    filters,

    // Actions
    loadAreas,
    loadAreaById,
    loadAreaChildren,
    loadAreaHierarchy,
    loadGeoJSON,
    loadAreaTypes,
    loadAreasByType,
    loadAreasByTypeGeoJSON,
    loadUserAreas,
    selectArea,
    deselectArea,
    updateFilters,
    resetFilters,
    dismissError,
    resetGeoJSON,
  };
};