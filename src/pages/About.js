import React from 'react';
import { Container, Typography, Box, Button } from '@mui/material';
import { Link } from 'react-router-dom';

function About() {
  return (
    <Container maxWidth="md" sx={{ py: 15, fontFamily:'Hei' }}>
      <Typography variant="h4" component="h1" gutterBottom>
        关于我们 ：）
      </Typography>
      <Box sx={{ my: 4, display: 'flex', justifyContent: 'center' }}>
        <Button component={Link} to="/oneofus" variant="contained" color="error">
         缓慢建站中🫧 如果你也在乎，请加入我们 🪢
        </Button>
      </Box>
      
      <p>
      作为华裔离散女性，我们的声音往往被忽视，我们的经验被简化或误解。我们被视为“安静的”移民、“顺从的”女性、“外来的”个体，而非真正的社会成员。
      但在这里，我们不仅记录，也彼此支持。在面对孤立、困境和系统性压迫的同时，我们共同寻找属于我们的安全感、归属感和新的可能性。
      </p>
      <p>
      人类天生具有流动性，我们不断迁徙，寻找更自由的生存空间。然而，作为华裔离散女性，我们的迁徙不仅仅是地理上的移动，更是一场涉及身份、文化、阶级、性别的复杂旅程。 种族歧视与性别歧视交织，使我们的身体成为被凝视、被操控、被贬低的对象——在工作场所，我们的专业能力被低估；在公共空间，我们成为骚扰的目标；在医疗系统，我们的需求被忽视；在社交互动中，我们被边缘化或被异化为刻板印象的一部分。
      </p>
      <p>
      我们拒绝沉默，因为说出我们的经历，就是一种反抗。
      当歧视与压迫未被言说，它们被掩盖、被合理化，成为日常运作的一部分。而当我们 naming it（指认它），我们打破沉默，不仅让自己的经历被看见，也为更广泛的群体争取空间。
      </p>
      <p>
        因此，我们创建了这个平台，以匿名的方式收集、分享华裔离散女性在新环境中的真实经历。我们相信，个人经验的累积能转化为更有力的社会行动的可能性，比如：
      </p>
      <ul>
      <li>
      年度反歧视报告 📊—— 收集数据，揭示系统性问题，并将其提交至当地反歧视组织，促使政策改进。
      </li>
      <li>
      街头行动与游行 🚶‍♀️—— 在公共空间发声，挑战刻板印象，抵抗种族化的性别暴力。
      </li>
      <li>
      行为艺术的可能性 🎭—— 用身体介入城市空间，打破日常中的隐形压迫，以艺术作为反抗的语言。
      </li>
      </ul>
    </Container>
  );
}

export default About;