import configureStoreProd from "./configureStore.prod";

const selectedConfigureStore = configureStoreProd;

export const { configureStore } = selectedConfigureStore;

export const { history } = selectedConfigureStore;
