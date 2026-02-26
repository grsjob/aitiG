import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, Form, Input, Button, Checkbox, Typography, message } from 'antd';
import { UserOutlined, LockOutlined } from '@ant-design/icons';
import styles from './Login.module.scss';
import { ROUTES } from '../../../shared/constants/routes.ts';
import { useLoginMutation } from '../api/authApi.ts';

const { Text, Link } = Typography;

export const Login: React.FC = () => {
  const [rememberMe, setRememberMe] = useState(false);
  const [login, { isLoading }] = useLoginMutation();
  const navigate = useNavigate();

  const onFinish = async (values: {username: string; password: string}) => {
    try {
      await login({
        username: values.username,
        password: values.password,
        rememberMe,
      }).unwrap();
      message.success('Успешный вход!');
      navigate(ROUTES.PRODUCTS);
    } catch (error) {
      message.error(`Ошибка входа. Проверьте логин и пароль ${error}`);
    }
  };

  return (
    <div className={styles.loginContainer}>
      <Card className={styles.loginCard} title='Добро пожаловать!'>
        <Text className={styles.subtitle}>Пожалуйста, авторизируйтесь</Text>
        <Form
          name='login'
          initialValues={{ remember: false }}
          onFinish={onFinish}
          size='large'
          layout='vertical'
        >
          <Form.Item name='username' rules={[{ required: true, message: 'Введите логин' }]}>
            <Input prefix={<UserOutlined />} placeholder='Логин' />
          </Form.Item>

          <Form.Item name='password' rules={[{ required: true, message: 'Введите пароль' }]}>
            <Input.Password prefix={<LockOutlined />} placeholder='Пароль' />
          </Form.Item>

          <Form.Item>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Checkbox checked={rememberMe} onChange={(e) => setRememberMe(e.target.checked)}>
                Запомнить меня
              </Checkbox>
            </div>
          </Form.Item>

          <Form.Item>
            <Button type='primary' htmlType='submit' loading={isLoading} block>
              Войти
            </Button>
          </Form.Item>

          <Form.Item style={{ textAlign: 'center', marginBottom: 0 }}>
            <Text type='secondary'>Нет аккаунта? </Text>
            <Link href='#'>Создать</Link>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
};
