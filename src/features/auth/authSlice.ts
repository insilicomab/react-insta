import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { RootState } from "../../app/store";
import axios from "axios";

import { PROPS_AUTHEN, PROPS_PROFILE, PROPS_NICKNAME } from "../types";

const apiUrl = process.env.REACT_APP_DEV_API_URL;

/* JWTトークンの取得の非同期関数 */
export const fetchAsyncLogin = createAsyncThunk(
  "auth/post",
  async (authen: PROPS_AUTHEN) => {
    const res = await axios.post(`${apiUrl}authen/jwt/create`, authen, {
      headers: {
        "Content-Type": "application/json",
      },
    });
    return res.data;
  }
);

/* 新規ユーザーを作成する非同期関数 */
export const fetchAsyncRegister = createAsyncThunk(
  "auth/register",
  async (auth: PROPS_AUTHEN) => {
    const res = await axios.post(`${apiUrl}api/register/`, auth, {
      headers: {
        "Content-Type": "application/json",
      },
    });
    return res.data;
  }
);

/* プロフィールの新規作成の非同期関数 */
export const fetchAsyncCreateProf = createAsyncThunk(
  "profile/post",
  async (nickName: PROPS_NICKNAME) => {
    const res = await axios.post(`${apiUrl}api/profile/`, nickName, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `JWT ${localStorage.localJWT}`, // ログイン認証していないとアクセスできないためJWTトークンを取得
      },
    });
    return res.data;
  }
);

/* プロフィールの更新の非同期関数 */
export const fetchAsyncUpdateProf = createAsyncThunk(
  "profile/put",
  async (profile: PROPS_PROFILE) => {
    const uploadData = new FormData();
    uploadData.append("nickName", profile.nickName);
    profile.img && uploadData.append("img", profile.img, profile.img.name);
    const res = await axios.put(
      `${apiUrl}api/profile/${profile.id}/`,
      uploadData,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `JWT ${localStorage.localJWT}`, // ログイン認証していないとアクセスできないためJWTトークンを取得
        },
      }
    );
    return res.data;
  }
);

/* ログインユーザーのプロフィールを取得する非同期関数 */
export const fetchAsyncGetMyProf = createAsyncThunk("profile/get", async () => {
  const res = await axios.get(`${apiUrl}api/myprofile/`, {
    headers: {
      Authorization: `JWT ${localStorage.localJWT}`, // ログイン認証していないとアクセスできないためJWTトークンを取得
    },
  });
  return res.data[0]; // DRFでfilterで取得した配列の要素にアクセス
});

/* 存在するプロフィールを取得する非同期関数 */
export const fetchAsyncGetProfs = createAsyncThunk("profiles/get", async () => {
  const res = await axios.get(`${apiUrl}api/profile/`, {
    headers: {
      Authorization: `JWT ${localStorage.localJWT}`, // ログイン認証していないとアクセスできないためJWTトークンを取得
    },
  });
  return res.data;
});

export const authSlice = createSlice({
  name: "auth",
  initialState: {
    openSignIn: true, // Login用モーダルの制御
    openSignUp: false, // Register用モーダルの制御
    openProfile: false, // プロフィール用モーダルの制御
    isLoadingAuth: false, // APIアクセス処理
    // ログインユーザーの制御
    myprofile: {
      id: 0,
      nickName: "",
      userProfile: 0,
      created_on: "",
      img: "",
    },
    // 存在するプロフィールの一覧
    profiles: [
      {
        id: 0,
        nickName: "",
        userProfile: 0,
        created_on: "",
        img: "",
      },
    ],
  },
  reducers: {
    // 外部APIアクセスの開始と終了のaction
    fetchCredStart(state) {
      state.isLoadingAuth = true;
    },
    fetchCredEnd(state) {
      state.isLoadingAuth = false;
    },
    // Loginモーダルの表示と非表示のaction
    setOpenSignIn(state) {
      state.openSignIn = true;
    },
    resetOpenSignIn(state) {
      state.openSignIn = false;
    },
    // Registerモーダルの表示と非表示のaction
    setOpenSignUp(state) {
      state.openSignUp = true;
    },
    resetOpenSignUp(state) {
      state.openSignUp = false;
    },
    // プロフィールモーダルの表示、非表示のaction
    setOpenProfile(state) {
      state.openProfile = true;
    },
    resetOpenProfile(state) {
      state.openProfile = false;
    },
    // ニックネーム編集のaction
    editNickname(state, action) {
      state.myprofile.nickName = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder.addCase(fetchAsyncLogin.fulfilled, (state, action) => {
      localStorage.setItem("localJWT", action.payload.access);
    });
    builder.addCase(fetchAsyncCreateProf.fulfilled, (state, action) => {
      state.myprofile = action.payload;
    });
    builder.addCase(fetchAsyncGetMyProf.fulfilled, (state, action) => {
      state.myprofile = action.payload;
    });
    builder.addCase(fetchAsyncGetProfs.fulfilled, (state, action) => {
      state.profiles = action.payload;
    });
    builder.addCase(fetchAsyncUpdateProf.fulfilled, (state, action) => {
      state.myprofile = action.payload;
      // Single Page Application
      state.profiles = state.profiles.map((prof) =>
        prof.id === action.payload.id ? action.payload : prof
      );
    });
  },
});

export const {
  fetchCredStart,
  fetchCredEnd,
  setOpenSignIn,
  resetOpenSignIn,
  setOpenSignUp,
  resetOpenSignUp,
  setOpenProfile,
  resetOpenProfile,
  editNickname,
} = authSlice.actions;

export const selectIsLoadingAuth = (state: RootState) =>
  state.auth.isLoadingAuth;
export const selectOpenSignIn = (state: RootState) => state.auth.openSignIn;
export const selectOpenSignUp = (state: RootState) => state.auth.openSignUp;
export const selectOpenProfile = (state: RootState) => state.auth.openProfile;
export const selectProfile = (state: RootState) => state.auth.myprofile;
export const selectProfiles = (state: RootState) => state.auth.profiles;

export default authSlice.reducer;
