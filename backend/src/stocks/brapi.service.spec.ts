import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { BrapiService } from './brapi.service';
import axios from 'axios';

jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

const mockConfig = (token = 'fake-token') => ({
  get: jest.fn().mockReturnValue(token),
});

describe('BrapiService', () => {
  let service: BrapiService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BrapiService,
        { provide: ConfigService, useValue: mockConfig() },
      ],
    }).compile();

    service = module.get<BrapiService>(BrapiService);
    jest.clearAllMocks();
  });

  describe('fetchQuotes', () => {
    it('retorna cotações quando a API responde com sucesso', async () => {
      mockedAxios.get.mockResolvedValueOnce({
        data: {
          results: [
            { symbol: 'PETR4', regularMarketPrice: 38.5 },
            { symbol: 'VALE3', regularMarketPrice: 62.1 },
          ],
        },
      });

      const result = await service.fetchQuotes(['PETR4', 'VALE3']);

      expect(result).toHaveLength(2);
      expect(result[0]).toEqual({ symbol: 'PETR4', regularMarketPrice: 38.5 });
      expect(result[1]).toEqual({ symbol: 'VALE3', regularMarketPrice: 62.1 });
    });

    it('retorna array vazio quando results está ausente', async () => {
      mockedAxios.get.mockResolvedValueOnce({ data: {} });

      const result = await service.fetchQuotes(['PETR4']);

      expect(result).toEqual([]);
    });

    it('retorna array vazio em caso de 404', async () => {
      mockedAxios.get.mockRejectedValueOnce({
        response: { status: 404, data: { message: 'Not found' } },
      });

      const result = await service.fetchQuotes(['TICKER_INVALIDO']);

      expect(result).toEqual([]);
    });

    it('retorna array vazio em caso de erro 401 (token inválido / plano free bloqueado)', async () => {
      mockedAxios.get.mockRejectedValueOnce({
        response: { status: 401, data: { message: 'Unauthorized' } },
      });

      const result = await service.fetchQuotes(['PETR4']);

      expect(result).toEqual([]);
    });

    it('retorna array vazio em caso de erro 429 (rate limit)', async () => {
      mockedAxios.get.mockRejectedValueOnce({
        response: { status: 429, data: { message: 'Too Many Requests' } },
      });

      const result = await service.fetchQuotes(['PETR4']);

      expect(result).toEqual([]);
    });

    it('retorna array vazio em caso de erro de rede', async () => {
      mockedAxios.get.mockRejectedValueOnce(new Error('Network Error'));

      const result = await service.fetchQuotes(['PETR4']);

      expect(result).toEqual([]);
    });

    it('inclui o token nos params quando configurado', async () => {
      mockedAxios.get.mockResolvedValueOnce({ data: { results: [] } });

      await service.fetchQuotes(['PETR4']);

      expect(mockedAxios.get).toHaveBeenCalledWith(
        expect.stringContaining('PETR4'),
        expect.objectContaining({ params: expect.objectContaining({ token: 'fake-token' }) }),
      );
    });

    it('não inclui token nos params quando não configurado', async () => {
      const moduleNoToken: TestingModule = await Test.createTestingModule({
        providers: [
          BrapiService,
          { provide: ConfigService, useValue: mockConfig('') },
        ],
      }).compile();

      const serviceNoToken = moduleNoToken.get<BrapiService>(BrapiService);
      mockedAxios.get.mockResolvedValueOnce({ data: { results: [] } });

      await serviceNoToken.fetchQuotes(['PETR4']);

      expect(mockedAxios.get).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({ params: {} }),
      );
    });
  });
});
