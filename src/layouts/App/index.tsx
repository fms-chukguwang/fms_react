import React, { useEffect } from "react";

import { useNavigate } from "react-router-dom";
import useSWR from "swr";
import fetcher from "utils/fetcher";
import { useTeamStore } from "store/teamStore";
import { useUserStore } from "store/userStore";
import { useProfileStore } from "store/profileStore";
import useAuthStore from "store/useAuthStore";
import {
  Card,
  Menu,
  MenuItem,
  PageContainer,
  ProfileSection,
  StyledLink,
} from "./styles";
import { Typography } from "antd";
import { useMemberStore } from "store/memberStore";

const { Title } = Typography;
interface LayoutProps {
  children: React.ReactNode;
}

/**
 * To Do
 * 1. 유저 정보 저장하기
 * 2. 프로필 페이지 만들기
 * 3. 프로필 페이지에서 서버로 데이터 전송
 */

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { data, error } = useSWR(
    "/users/me",
    fetcher
    // { dedupingInterval: 1000 * 60 * 60 * 24 }
  );
  const { id: memberId, setMemberId } = useMemberStore();
  const { teamId, setTeamInfo, chatId } = useTeamStore();
  const { id: userId, setUser } = useUserStore();
  const { logout } = useAuthStore();
  const { setProfile, id: profileId, resetProfile } = useProfileStore();
  const navigate = useNavigate();

  useEffect(() => {
    if (data) {
      resetProfile();
      setUser(data.data);
      setTeamInfo(
        data.data.member[0]?.team?.id,
        data.data.member[0]?.team?.name,
        data.data.member[0]?.team?.imageUUID,
        data.data.member[0]?.team?.chat?.id
      );
      // setMember(data.data.member[0]?.id);
      setMemberId(data.data.member[0]?.id);
    }

    if (data?.data.profile) {
      console.log("data.data.profile1=", data.data.profile);
      setProfile(data.data.profile);
      console.log("data.data.profile2=", data.data.profile);
    }
  }, [data]);
  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <PageContainer>
      <Menu>
        <MenuItem>
          <StyledLink to="/home">HOME</StyledLink>
        </MenuItem>
        <MenuItem>
          <StyledLink
            to={
              profileId
                ? `/profile/${profileId}`
                : userId
                ? `/profile/${userId}/register`
                : "/home"
            }
            onClick={() => {
              if (!profileId && !userId) {
                alert("죄송합니다! MY PROFILE을 다시 클릭해주세요");
                navigate("/home");
              }
            }}>
            MY PROFILE
          </StyledLink>
        </MenuItem>

        {teamId ? (
          <>
            <MenuItem>
              <StyledLink to="/team">TEAM</StyledLink>
            </MenuItem>
            <MenuItem>
              <StyledLink to="/match/calendar">SCHEDULE</StyledLink>
            </MenuItem>
            <MenuItem>
              <StyledLink to="/player">PLAYER</StyledLink>
            </MenuItem>
            <MenuItem>
              <StyledLink to="/memberTable">INVITE</StyledLink>
            </MenuItem>
            <MenuItem>
              <StyledLink to="/teamTable">JOIN</StyledLink>
            </MenuItem>
          </>
        ) : (
          <></>
        )}

        <MenuItem
          onClick={handleLogout}
          style={{
            color: "#445664",
          }}>
          LOGOUT
        </MenuItem>
      </Menu>
      <Card>
        <h2>
          <StyledLink to="/home">
            <img
              src="img/title2.png"
              alt="축구왕"
              style={{ cursor: "pointer", width: "20%" }}
            />
          </StyledLink>
        </h2>

        {children}
      </Card>
    </PageContainer>
  );
};

export default Layout;
