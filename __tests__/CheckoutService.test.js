import { CheckoutService } from '../src/services/CheckoutService.js';
import { Item } from '../src/domain/Item.js';
import { CarrinhoBuilder } from './builders/CarrinhoBuilder.js';
import { UserMother } from './builders/UserMother.js';

describe('CheckoutService', () => {
    describe('quando o pagamento falha', () => {
        it('retorna null e não persiste nem envia e-mail', async () => {
            // Arrange
            const carrinho = new CarrinhoBuilder().build();
            const gatewayStub = {
                cobrar: jest.fn().mockResolvedValue({ success: false })
            };
            const repositoryDummy = {
                salvar: jest.fn()
            };
            const emailDummy = {
                enviarEmail: jest.fn()
            };
            const checkoutService = new CheckoutService(
                gatewayStub,
                repositoryDummy,
                emailDummy
            );

            // Act
            const pedido = await checkoutService.processarPedido(
                carrinho,
                '4111111111111111'
            );

            // Assert
            expect(pedido).toBeNull();
            expect(repositoryDummy.salvar).not.toHaveBeenCalled();
            expect(emailDummy.enviarEmail).not.toHaveBeenCalled();
        });
    });

    describe('quando um cliente padrão finaliza a compra', () => {
        it('retorna o pedido salvo com o total sem desconto', async () => {
            // Arrange
            const carrinho = new CarrinhoBuilder()
                .comUser(UserMother.umUsuarioPadrao())
                .comItens([new Item('Produto', 200)])
                .build();
            const gatewayStub = {
                cobrar: jest.fn().mockResolvedValue({ success: true })
            };
            const pedidoSalvo = { id: 10 };
            const repositoryStub = {
                salvar: jest.fn().mockResolvedValue(pedidoSalvo)
            };
            const emailDummy = {
                enviarEmail: jest.fn().mockResolvedValue(undefined)
            };
            const checkoutService = new CheckoutService(
                gatewayStub,
                repositoryStub,
                emailDummy
            );

            // Act
            const pedido = await checkoutService.processarPedido(
                carrinho,
                '4111111111111111'
            );

            // Assert
            expect(pedido).toBe(pedidoSalvo);
            expect(repositoryStub.salvar).toHaveBeenCalledWith(
                expect.objectContaining({ totalFinal: 200 })
            );
        });
    });

    describe('quando um cliente Premium finaliza a compra', () => {
        it('cobra o valor com 10% de desconto', async () => {
            // Arrange
            const usuarioPremium = UserMother.umUsuarioPremium();
            const carrinho = new CarrinhoBuilder()
                .comUser(usuarioPremium)
                .comItens([new Item('Compra Premium', 200)])
                .build();
            const gatewayStub = {
                cobrar: jest.fn().mockResolvedValue({ success: true })
            };
            const repositoryStub = {
                salvar: jest.fn().mockResolvedValue({ id: 11 })
            };
            const emailMock = {
                enviarEmail: jest.fn().mockResolvedValue(undefined)
            };
            const checkoutService = new CheckoutService(
                gatewayStub,
                repositoryStub,
                emailMock
            );

            // Act
            await checkoutService.processarPedido(carrinho, '4111111111111111');

            // Assert
            expect(gatewayStub.cobrar).toHaveBeenCalledWith(
                180,
                '4111111111111111'
            );
        });

        it('envia um e-mail de aprovação com os dados do pedido', async () => {
            // Arrange
            const usuarioPremium = UserMother.umUsuarioPremium();
            const carrinho = new CarrinhoBuilder()
                .comUser(usuarioPremium)
                .comItens([new Item('Compra Premium', 200)])
                .build();
            const gatewayStub = {
                cobrar: jest.fn().mockResolvedValue({ success: true })
            };
            const repositoryStub = {
                salvar: jest.fn().mockResolvedValue({ id: 12 })
            };
            const emailMock = {
                enviarEmail: jest.fn().mockResolvedValue(undefined)
            };
            const checkoutService = new CheckoutService(
                gatewayStub,
                repositoryStub,
                emailMock
            );

            // Act
            await checkoutService.processarPedido(carrinho, '4111111111111111');

            // Assert
            expect(emailMock.enviarEmail).toHaveBeenCalledTimes(1);
            expect(emailMock.enviarEmail).toHaveBeenCalledWith(
                'premium@email.com',
                'Seu Pedido foi Aprovado!',
                'Pedido 12 no valor de R$180'
            );
        });
    });
});