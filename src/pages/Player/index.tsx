import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Pagination } from 'antd';
import Layout from 'layouts/App';
import './table.css';
import { useTeamStore } from 'store/teamStore';
import { useNavigate } from 'react-router-dom';
import { configConsumerProps } from 'antd/es/config-provider';
import { useUserStore } from 'store/userStore';

interface Member {
    id: number;
    user: User;
    isStaff: boolean;
}

interface User {
    id: number;
    email: string;
    name: string;
    profile: Profile;
}

interface Profile {
    preferredPosition: string;
    imageUrl: string;
    age: number;
}

const Player: React.FC = () => {
    const [members, setMembers] = useState<Member[]>([]);
    const [isCreator, setIsCreator] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [selectedMember, setSelectedMember] = useState<Member | null>(null);
    const [total, setTotal] = useState(0);
    const [searchQuery, setSearchQuery] = useState('');
    const [currentPage, setCurrentPage] = useState(1);

    const { teamId, setTeamId } = useTeamStore();
    const { id } = useUserStore();
    const navigate = useNavigate();

    const fetchMembers = async (page: number = 1) => {
        try {
            let apiUrl = `${process.env.REACT_APP_SERVER_HOST}:${
                process.env.REACT_APP_SERVER_PORT || 3000
            }/api/team/${teamId}/members/?page=${page}`;

            if (searchQuery.trim() !== '') {
                apiUrl += `&name=${searchQuery}`;
            }
            const accessToken = localStorage.getItem('accessToken');
            const response = await axios.get(apiUrl, {
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                },
                withCredentials: true,
            });

            setMembers(response.data.data);
            setTotal(response.data.total);
        } catch (error) {
            console.error('팀 정보를 불러오는 데 실패했습니다.', error);
            setMembers([]);
            setTotal(0);
        }
    };

    useEffect(() => {
        const accessToken = localStorage.getItem('accessToken');

        // 구단주 체크를 수행하는 함수
        const checkIfIsCreator = async () => {
            try {
                const response = await axios.get(
                    `${process.env.REACT_APP_SERVER_HOST}:${
                        process.env.REACT_APP_SERVER_PORT || 3000
                    }/api/match/creator`,
                    {
                        headers: {
                            Authorization: `Bearer ${accessToken}`, // Bearer 토큰 추가
                        },
                    }
                );
                const creatorId = response.data?.data[0]?.id;
                setIsCreator(!!creatorId); // creatorId가 존재하면 구단주로 간주
            } catch (error) {
                console.error('데이터 불러오기 실패:', error);
            }
        };

        const fetchData = async () => {
            try {
                if (teamId === undefined || teamId === null) {
                    console.error('Team ID is not defined.');
                    return;
                }

                setTeamId(teamId);

                const response = await axios.get(
                    `${process.env.REACT_APP_SERVER_HOST}:${
                        process.env.REACT_APP_SERVER_PORT || 3000
                    }/api/team/${teamId}/members/?page=${currentPage}&name=${searchQuery}`,
                    {
                        headers: {
                            Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
                        },
                        withCredentials: true,
                    }
                );
                setMembers(response.data.data);
                setTotal(response.data.total);
            } catch (error) {
                console.error('팀 정보를 불러오는 데 실패했습니다.', error);
                setMembers([]);
                setTotal(0);
            }
        };

        if (teamId !== undefined) {
            fetchData();
            checkIfIsCreator();
            const delay = setTimeout(() => {
                fetchData();
            }, 500);

            return () => clearTimeout(delay);
        }
    }, [teamId, currentPage, searchQuery]);

    const changePage = async (page: number) => {
        setCurrentPage(page);
        fetchMembers();
    };

    const [show, setShow] = useState(false);

    const handleApplyButton = (team: Member) => {
        setSelectedMember(team);
        setShowModal(true);
        setShow(true);

        if (team.id) {
            navigate(`/team/member/${team.id}`);
        }
    };

    const handleSearchButtonClick = () => {
        fetchMembers();
    };

    const expulsionMember = async (memberId: number) => {
        try {
            const accessToken = localStorage.getItem('accessToken');

            const response = await axios.delete(
                `${process.env.REACT_APP_SERVER_HOST}:${
                    process.env.REACT_APP_SERVER_PORT || 3000
                }/api/team/${teamId}/member/${memberId}/expulsion`,
                {
                    headers: {
                        Authorization: `Bearer ${accessToken}`,
                    },
                    withCredentials: true,
                }
            );

            alert(response.data.message);
        } catch (error) {
            alert(error);
        }
    };

    const handleExpulsionButton = (memberId: number) => {
        // eslint-disable-next-line no-restricted-globals
        const userConfirmed = confirm('해당 회원을 탈퇴 처리 하시겠습니까?');

        if (userConfirmed) {
            // "OK"를 클릭한 경우, 회원 탈퇴 처리를 진행합니다.
            expulsionMember(memberId);
        }
    };

    return (
        <Layout>
            <h2>팀 멤버 조회</h2>
            <div>
                <div className="search-container">
                    <input
                        type="text"
                        placeholder="이름 검색"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        onKeyPress={(e) => {
                            if (e.key === 'Enter') {
                                fetchMembers();
                            }
                        }}
                    />
                    <button onClick={handleSearchButtonClick}>검색</button>
                </div>
            </div>
            <table>
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>이름</th>
                        <th>구단주 여부</th>
                        <th>이메일</th>
                        <th>선호 포지션</th>
                        <th>나이</th>
                        <th>더보기</th>
                    </tr>
                </thead>

                <tbody>
                    {members &&
                        members.map((member, index) => (
                            <tr key={`memberData-${index}`}>
                                <td>{member.id}</td>
                                <td>{member.user.name}</td>
                                <td>{member.isStaff ? '구단주' : '일반선수'}</td>
                                <td>{member.user.email}</td>
                                <td>{member.user.profile?.preferredPosition}</td>
                                <td>{member.user.profile?.age}</td>
                                <td>
                                    <button onClick={() => handleApplyButton(member)}>링크</button>
                                    {isCreator && parseInt(id) !== member.user.id ? (
                                        <button onClick={() => handleExpulsionButton(member.id)}>강퇴</button>
                                    ) : (
                                        ''
                                    )}
                                </td>
                            </tr>
                        ))}
                </tbody>
            </table>
            <Pagination
                defaultCurrent={currentPage}
                total={total}
                defaultPageSize={5}
                onChange={(value) => {
                    changePage(value);
                }}
            />
        </Layout>
    );
};

export default Player;
