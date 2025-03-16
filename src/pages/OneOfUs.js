import React from "react";
import { Container, Row, Col, Card, Button } from 'react-bootstrap';

function OneOfUs() {
  const volunteerRoles = [
    {
      emoji: "📝",
      title: "分享你的故事",
      description: "你的经历就是改变的一部分！通过匿名投稿，你可以让更多人了解我们在新环境中面临的挑战，也让彼此知道，我们并不孤单。"
    },
    {
      emoji: "📢",
      title: "邀请朋友加入",
      description: "让更多人使用这个平台，阅读、分享、投稿——每一个故事的传播，都是打破沉默的重要一步。"
    },
    {
      emoji: "💻",
      title: "程序员 | 让网站更友好",
      description: "如果你懂网页开发或交互设计，你可以帮助我们优化网站体验，让它更加流畅、易用，让更多人可以自由地分享和阅读故事。"
    },
    {
      emoji: "🌍",
      title: "翻译志愿者 | 让更多人听见我们的声音",
      description: "把我们的故事翻译成西班牙语，让当地社会、政府、人权组织了解我们的处境，共同推动真正的改变。"
    },
    {
      emoji: "👀",
      title: "审核员 | 维护安全空间",
      description: "帮助审核内容，确保留言区没有恶意攻击或歧视性言论，让这个平台成为一个真正安全、支持彼此的空间。"
    }
  ];

  return (
    <Container className="py-5">
      <Row className="text-center mb-5">
        <Col>
          <h1 className="display-4 mb-3">
            If you are <span className="text-warning fw-bold">One of Us</span>
          </h1>
          <h2 className="h3 mb-4">We need you!</h2>
          <p className="lead mb-4">
            我们正在寻找志愿者，一起推动这个仍在萌芽中的档案项目，让华裔离散女性的声音被听见，被记录，被认真对待。
          </p>
          <p className="lead">
            如果你愿意支持我们，你可以贡献你的力量：
          </p>
        </Col>
      </Row>

      <Row className="g-4">
        {volunteerRoles.map((role, index) => (
          <Col md={6} lg={4} key={index}>
            <Card className="h-100 shadow-sm hover-shadow">
              <Card.Body className="d-flex flex-column">
                <div className="display-4 mb-3 text-center">
                  {role.emoji}
                </div>
                <Card.Title className="h5 mb-3 text-center">
                  {role.title}
                </Card.Title>
                <Card.Text className="text-muted">
                  {role.description}
                </Card.Text>
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>

      <Row className="text-center mt-5">
        <Col>
          <Button 
            href="https://forms.gle/MJiKMADnA9RaVqKK9"
            variant="outline-warning"
            target="_blank"
            size="lg"
            className="px-5 py-3 shadow"
          >
            🏃‍♀️ Be one of us
          </Button>
        </Col>
      </Row>
    </Container>
  );
}

export default OneOfUs;