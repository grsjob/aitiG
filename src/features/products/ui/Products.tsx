import React, { useState } from 'react';
import {
  Table,
  Button,
  Input,
  Space,
  Typography,
  Modal,
  Form,
  InputNumber,
  message,
  Image,
  Pagination,
  type TableProps,
} from 'antd';
import { EllipsisOutlined, PlusOutlined, ReloadOutlined, SearchOutlined } from '@ant-design/icons';
import styles from './Products.module.scss';
import { useGetProductsQuery, useSearchProductsQuery } from '../api/productsApi.ts';
import type { Product } from '../model/types.ts';
import { useDebounce } from '../../../shared/hooks/useDebounce.ts';
import type { ColumnsType } from 'antd/es/table';

const { Title, Text } = Typography;

interface DisplayProduct {
  key: number;
  id: number;
  name: string;
  category: string;
  vendor: string;
  article: string;
  rating: number;
  price: number;
  images: string[];
}

interface AddProductForm {
  name: string;
  price: number;
  vendor: string;
  article: string;
  category: string;
}

export const Products: React.FC = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form] = Form.useForm();

  const debouncedSearch = useDebounce(searchTerm);

  const [sortConfig, setSortConfig] = useState<{
    field: string;
    order: 'ascend' | 'descend' | null;
  }>({ field: '', order: null });

  const isSearchMode = debouncedSearch.trim().length > 0;

  const {
    data: productsData,
    isFetching: isProductsFetching,
    error: productsError,
  } = useGetProductsQuery(
    {
      limit: pageSize,
      skip: (currentPage - 1) * pageSize,
    },
    { skip: isSearchMode }
  );

  const {
    data: searchData,
    isFetching: isSearchFetching,
    error: searchError,
  } = useSearchProductsQuery(debouncedSearch, { skip: !isSearchMode });

  const data = isSearchMode ? searchData : productsData;
  const isFetching = isSearchMode ? isSearchFetching : isProductsFetching;
  const error = isSearchMode ? searchError : productsError;

  const displayProducts: DisplayProduct[] = React.useMemo(() => {
    if (!data?.products) return [];

    return data.products.map((product: Product, index: number) => ({
      key: product.id,
      id: product.id,
      name: product.title,
      category: product.category || 'Аксессуары',
      vendor: product.brand || '—',
      article: `ART-${product.id}${String.fromCharCode(65 + (index % 26))}`,
      rating: product.rating || 4.0,
      price: product.price,
      images: product.images || [],
    }));
  }, [data]);

  const sortedProducts = React.useMemo(() => {
    if (!sortConfig.field || !sortConfig.order) return displayProducts;

    return [...displayProducts].sort((a, b) => {
      let aValue = a[sortConfig.field as keyof DisplayProduct];
      let bValue = b[sortConfig.field as keyof DisplayProduct];

      if (sortConfig.field === 'price' || sortConfig.field === 'rating') {
        aValue = Number(aValue);
        bValue = Number(bValue);
      }

      if (aValue < bValue) return sortConfig.order === 'ascend' ? -1 : 1;
      if (aValue > bValue) return sortConfig.order === 'ascend' ? 1 : -1;
      return 0;
    });
  }, [displayProducts, sortConfig]);

  const handleTableChange: TableProps<DisplayProduct>['onChange'] = (_, __, sorter) => {
    if (sorter && 'field' in sorter && sorter.order) {
      setSortConfig({
        field: sorter.field as string,
        order: sorter.order,
      });
    } else {
      setSortConfig({ field: '', order: null });
    }
  };

  const handlePageChange = (page: number, pageSize?: number) => {
    setCurrentPage(page);
    if (pageSize) {
      setPageSize(pageSize);
    }
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  const handleAddProduct = () => {
    form
      .validateFields()
      .then((values: AddProductForm) => {
        console.log('New product:', values);
        message.success('Товар успешно добавлен!');
        setIsModalOpen(false);
        form.resetFields();
      })
      .catch((info) => {
        console.log('Validate Failed:', info);
      });
  };

  const columns: ColumnsType<DisplayProduct> = [
    {
      title: 'Наименование',
      dataIndex: 'name',
      key: 'name',
      width: 300,
      sorter: true,
      sortOrder: sortConfig.field === 'name' ? sortConfig.order : null,
      render: (text: string, record: DisplayProduct) => (
        <div style={{ display: 'flex', gap: 20 }}>
          <div style={{ width: 40, height: 40, background: '#C4C4C4' }}>
            <Image src={record.images[0]} width={40} height={40} />
          </div>
          <div>
            <div className={styles.productName}>{text}</div>
            <div className={styles.productCategory}>{record.category}</div>
          </div>
        </div>
      ),
    },
    {
      title: 'Вендор',
      dataIndex: 'vendor',
      key: 'vendor',
      width: 150,
      sorter: true,
      sortOrder: sortConfig.field === 'vendor' ? sortConfig.order : null,
      render: (text: string) => <span className={styles.vendorTag}>{text}</span>,
    },
    {
      title: 'Артикул',
      dataIndex: 'article',
      key: 'article',
      width: 150,
      sorter: true,
      sortOrder: sortConfig.field === 'article' ? sortConfig.order : null,
    },
    {
      title: 'Оценка',
      dataIndex: 'rating',
      key: 'rating',
      width: 120,
      sorter: true,
      sortOrder: sortConfig.field === 'rating' ? sortConfig.order : null,
      render: (rating: number) => (
        <div>
          <span className={rating < 3 ? styles.ratingLow : undefined}>{rating.toFixed(1)}</span>
          <span>/5</span>
        </div>
      ),
    },
    {
      title: 'Цена, ₽',
      dataIndex: 'price',
      key: 'price',
      width: 150,
      align: 'right' as const,
      sorter: true,
      sortOrder: sortConfig.field === 'price' ? sortConfig.order : null,
      render: (price: number) => {
        const formattedPrice = price.toLocaleString('ru-RU', {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        });

        const [integerPart, fractionalPart] = formattedPrice.split(',');

        return (
          <span>
            <span style={{ marginRight: 2 }}>{integerPart}</span>
            <span style={{ color: '#bfbfbf', marginLeft: 2 }}>,{fractionalPart}</span>
          </span>
        );
      },
    },
    {
      title: '',
      key: 'actions',
      width: 150,
      render: () => (
        <Space size='middle'>
          <div className={styles.buttonContainer}>
            <Button type='primary' shape='round' icon={<PlusOutlined />} size='small' />
          </div>
          <Button icon={<EllipsisOutlined />} shape='round' size='small' />
        </Space>
      ),
    },
  ];

  if (error) {
    return (
      <div style={{ padding: 24, textAlign: 'center' }}>
        <Title level={3}>Ошибка загрузки данных</Title>
        <Button type='primary' onClick={() => window.location.reload()}>
          Повторить
        </Button>
      </div>
    );
  }

  return (
    <div className={styles.productsContainer}>
      <div className={styles.header}>
        <div className={styles.titleSection}>
          <Title level={2}>Товары</Title>
        </div>

        <div className={styles.searchSection}>
          <Input
            placeholder='Найти'
            prefix={<SearchOutlined style={{ color: '#bfbfbf' }} />}
            value={searchTerm}
            onChange={handleSearchChange}
            allowClear
            size='large'
          />
        </div>
      </div>

      <div className={styles.tableContainer}>
        <>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: 20,
            }}
          >
            <span style={{ fontSize: 20, fontWeight: 700 }}>Все позиции</span>
            <div style={{ display: 'flex', gap: 10 }}>
              <Button type={'text'} icon={<ReloadOutlined />} />
              <Button
                type='primary'
                icon={<PlusOutlined />}
                onClick={() => setIsModalOpen(true)}
                size='middle'
              >
                Добавить
              </Button>
            </div>
          </div>

          <Table
            rowSelection={{ type: 'checkbox' }}
            columns={columns}
            dataSource={sortedProducts}
            pagination={false}
            loading={isFetching}
            onChange={handleTableChange}
            rowClassName={() => 'product-row'}
            locale={{ emptyText: 'Товары не найдены' }}
          />

          <div className={styles.footer}>
            <Text type='secondary'>
              Показано 1-{displayProducts.length} из {data?.total || 0}
            </Text>

            <Pagination
              current={currentPage}
              total={data?.total || 0}
              pageSize={pageSize}
              onChange={handlePageChange}
              showSizeChanger
              pageSizeOptions={['5', '25', '50', '100']}
            />
          </div>
        </>
      </div>

      <Modal
        title='Добавление товара'
        open={isModalOpen}
        onOk={handleAddProduct}
        onCancel={() => {
          setIsModalOpen(false);
          form.resetFields();
        }}
        okText='Добавить'
        cancelText='Отмена'
        width={500}
      >
        <Form
          form={form}
          layout='vertical'
          initialValues={{
            name: '',
            price: 0,
            vendor: '',
            article: '',
            category: 'Аксессуары',
          }}
        >
          <Form.Item
            name='name'
            label='Наименование'
            rules={[{ required: true, message: 'Введите наименование товара' }]}
          >
            <Input placeholder='Например: USB Флэшкарта 16GB' />
          </Form.Item>

          <Form.Item
            name='category'
            label='Категория'
            rules={[{ required: true, message: 'Введите категорию' }]}
          >
            <Input placeholder='Например: Аксессуары' />
          </Form.Item>

          <Form.Item
            name='vendor'
            label='Вендор'
            rules={[{ required: true, message: 'Введите вендора' }]}
          >
            <Input placeholder='Например: Samsung' />
          </Form.Item>

          <Form.Item
            name='article'
            label='Артикул'
            rules={[{ required: true, message: 'Введите артикул' }]}
          >
            <Input placeholder='Например: RCH45Q1A' />
          </Form.Item>

          <Form.Item
            name='price'
            label='Цена, ₽'
            rules={[{ required: true, message: 'Введите цену' }]}
          >
            <InputNumber
              style={{ width: '100%' }}
              min={0}
              step={100}
              placeholder='48652'
              formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ' ')}
            />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};
