import React from 'react';
import { Container, Typography, Box, Button } from '@mui/material';
import { Link } from 'react-router-dom';
import styled from 'styled-components';
import Contributors from '../components/Contributors';
import backgroundImage from '../assets/images/background.png';

const AboutContainer = styled(Box)`
  min-height: 100vh;
  padding: 80px 20px 40px;
  font-family: 'SimHei', 'Microsoft YaHei', sans-serif;
  position: relative;

  &::before {
    content: '';
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-image: url(${backgroundImage});
    background-size: cover;
    background-position: center;
    background-repeat: no-repeat;
    z-index: -1;
  }
`;

const StyledContainer = styled(Container)`
  max-width: 60vw !important;

  @media (max-width: 768px) {
    max-width: 100vw !important;
    padding: 0 16px;
  }
`;

const MainTitle = styled(Typography)`
  font-family: 'Avenir', monospace;
  font-size: 4rem;
  font-weight: bold;
  text-align: left;
  color: black;
  margin-bottom: 30px;
  letter-spacing: 1px;
  
  @media (max-width: 768px) {
    font-size: 1.8rem;
    margin-bottom: 40px;
  }
`;


const ContentText = styled(Typography)`
  font-family: 'Avenir Next';
  font-size: 1.1rem;
  line-height: 1.1;
  color: black;
  margin-bottom: 16px;
  text-align: justify;
  
  @media (max-width: 768px) {
    font-size: 1.2rem;
    line-height: 1;
  }
`;

const WhatWeDoSection = styled(Box)`
  margin: 40px 0;
  padding: 20px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  backdrop-filter: blur(10px);
`;

const WhatWeDoTitle = styled(Typography)`
  font-family: 'SimHei', 'Microsoft YaHei', sans-serif;
  font-size: 1.6rem;
  font-weight: bold;
  color: black;
  margin-bottom: 20px;
`;

const ActionItem = styled(Box)`
  margin-bottom: 12px;
  font-family: 'SimHei', 'Microsoft YaHei', sans-serif;
  font-size: 1rem;
  line-height: 1.6;
  color: black;
`;

const ButtonContainer = styled(Box)`
  display: flex;
  justify-content: center;
  gap: 20px;
  margin: 30px 0;

  @media (max-width: 768px) {
    flex-direction: column;
    align-items: center;
    gap: 15px;
  }
`;

const StyledButton = styled(Button)`
  background:rgba(219, 219, 219, 0.83);
  color: black;
  border: 1px solid black;
  border-radius: 0px;
  padding: 5px 5px;
  font-family: 'Avenir', 'Microsoft YaHei', sans-serif;
  font-size: 1rem;
  font-weight: bold;
  transition: all 0.3s ease;

  &:hover {
    background: black;
    color: white;
    transform: translateY(-3px);
    box-shadow: 0 8px 25px rgba(255, 0, 94, 0.4);
  }

  @media (max-width: 768px) {
    width: 100%;
    max-width: 300px;
  }
`;

function About() {
  return (
    <AboutContainer>
      <StyledContainer>
        <MainTitle>
          🎈红气球
        </MainTitle>

        <ContentText>
          我们是一群生活在海外的华人女性，来自不同背景，却在相似的压迫结构中挣扎与觉醒。
          我们用行动抵抗沉默，用彼此的故事打破孤岛。
          这个档案计划由女性、酷儿与移民共同发起，连接散落各地的我们，为看不见的经验留下痕迹。
        </ContentText>

        <ContentText>
          作为华裔离散女性，我们的声音往往被忽视，我们的经验被简化或误解。我们被视为"安静的"移民、"顺从的"女性、"外来的"个体，而非真正的社会成员。
          但在这里，我们不仅记录，也彼此支持。在面对孤立、困境和系统性压迫的同时，我们共同寻找属于我们的安全感、归属感和新的可能性。
        </ContentText>

        <ContentText>
          人类天生具有流动性，我们不断迁徙，寻找更自由的生存空间。然而，作为华裔离散女性，我们的迁徙不仅仅是地理上的移动，更是一场涉及身份、文化、阶级、性别的复杂旅程。种族歧视与性别歧视交织，使我们的身体成为被凝视、被操控、被贬低的对象——在工作场所，我们的专业能力被低估；在公共空间，我们成为骚扰的目标；在医疗系统，我们的需求被忽视；在社交互动中，我们被边缘化或被异化为刻板印象的一部分。
        </ContentText>

        <ContentText>
          我们拒绝沉默，因为说出我们的经历，就是一种反抗。
          当歧视与压迫未被言说，它们被掩盖、被合理化，成为日常运作的一部分。而当我们naming it（指认它），我们打破沉默，不仅让自己的经历被看见，也为更广泛的群体争取空间。
        </ContentText>

        <ContentText>
          因此，我们创建了这个平台，以匿名的方式收集、分享华裔离散女性在新环境中的真实经历。我们相信，个人经验的累积能转化为更有力的社会行动的可能性。
        </ContentText>

        <WhatWeDoSection>
          <WhatWeDoTitle>我们在做什么</WhatWeDoTitle>
          <ActionItem>
            <strong>华人女性档案地图</strong>，记录各地女性的真实经历，建立一个去中心化、可感的反暴力资料库。
          </ActionItem>
          <ActionItem>
            <strong>行动艺术 & 街头干预</strong>，把隐蔽变成声音、图像与身体，在街头下流动，让伤被看见，也被回应。
          </ActionItem>
          <ActionItem>
            <strong>故事驱动行动</strong>，将匿名故事转化为政策倡导、社群教育和跨议题对话的起点。
          </ActionItem>
          <ActionItem>
            <strong>反歧视工具箱</strong>，整合法律援助、心理支持与互助网络，陪伴彼此在异乡多重身份与自救。
          </ActionItem>
        </WhatWeDoSection>

        <ButtonContainer>
          <StyledButton component={Link} to="https://forms.gle/MJiKMADnA9RaVqKK9" target="_blank">
            🪢 如果你也在乎，请加入我们
          </StyledButton>

          <StyledButton>
            🎈帮助Archive继续记录
          </StyledButton>
        </ButtonContainer>

      </StyledContainer>
    </AboutContainer>
  );
}

export default About;
